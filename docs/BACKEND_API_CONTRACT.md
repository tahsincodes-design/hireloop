# HireLoop Backend API Contract

This document is the contract between the HireLoop Next.js client and the
Express API. The dashboard is wired against these paths. Endpoints that are not
implemented yet are called out explicitly in
[Current implementation status](#current-implementation-status) — the UI shows
honest “endpoint unavailable” states for those instead of fabricating data.

## Architecture

```
Browser (dashboard)
  │  fetch("/api/backend/<path>?query", { credentials: "same-origin" })
  ▼
Next.js route handler  app/api/backend/[...path]/route.ts
  │  • reads the Better Auth session cookie
  │  • rejects unauthenticated (401) and suspended (403) accounts
  │  • enforces role/path rules (table below)
  │  • signs an HMAC identity envelope
  ▼
Express API  (NEXT_PUBLIC_API_BASE_URL, default http://localhost:5000)
     • MUST verify the HMAC envelope
     • MUST enforce authorization and ownership again
     • is the only source of business data
```

Server Components do not go through the proxy. They call Express directly with
`lib/api/server.ts`, which builds the same signed headers from the Better Auth
session.

### Configuration

| Variable                    | Where           | Meaning                                                |
| --------------------------- | --------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`  | `.env`          | Express origin. Blank → `http://localhost:5000`.        |
| `BETTER_AUTH_SECRET`        | `.env` (secret) | Better Auth secret; also used as the HMAC signing key.  |
| `BETTER_AUTH_URL`           | `.env`          | Better Auth base URL.                                   |
| `STRIPE_SECRET_KEY`         | `.env` (secret) | Server-side Stripe key used to create Checkout Sessions. |
| `STRIPE_RECRUITER_PRICE_ID` | `.env`          | Optional override for the Recruiter Growth Price ID.    |

This project uses one `.env` file. Do not add `.env.local` or per-environment
env files; everything is read from `.env`.

Rules:

- The client normalizes trailing slashes, so `https://api.example.com/` and
  `https://api.example.com` are equivalent.
- Never expose `BETTER_AUTH_SECRET` or the Express origin’s admin credentials to
  the browser. Only `NEXT_PUBLIC_API_BASE_URL` is public.
- All browser requests go to same-origin `/api/backend/*`, never directly to
  Express.

## Identity envelope (required)

Every request reaching Express from the Next.js app carries:

| Header                   | Value                                                |
| ------------------------ | ---------------------------------------------------- |
| `x-hireloop-user-id`     | Better Auth user id (string)                         |
| `x-hireloop-user-role`   | `seeker` \| `recruiter` \| `admin`                   |
| `x-hireloop-timestamp`   | Unix epoch milliseconds, as a string                 |
| `x-hireloop-signature`   | `hex(HMAC_SHA256(secret, `${userId}.${role}.${timestamp}`))` |
| `x-hireloop-client`      | `hireloop-web`                                       |

`secret` is `BETTER_AUTH_SECRET`.

### Verification middleware (reference implementation)

```js
import { createHmac, timingSafeEqual } from "node:crypto"

const MAX_SKEW_MS = 60_000

export function verifyHireloopIdentity(req, res, next) {
  const id = req.get("x-hireloop-user-id")
  const role = req.get("x-hireloop-user-role")
  const timestamp = req.get("x-hireloop-timestamp")
  const signature = req.get("x-hireloop-signature")

  if (!id || !role || !timestamp || !signature) {
    return res.status(401).json({ error: "Missing identity headers." })
  }

  if (!["seeker", "recruiter", "admin"].includes(role)) {
    return res.status(401).json({ error: "Invalid identity role." })
  }

  const issuedAt = Number(timestamp)
  if (!Number.isFinite(issuedAt) || Math.abs(Date.now() - issuedAt) > MAX_SKEW_MS) {
    return res.status(401).json({ error: "Stale or invalid identity timestamp." })
  }

  const expected = createHmac("sha256", process.env.BETTER_AUTH_SECRET)
    .update(`${id}.${role}.${timestamp}`)
    .digest("hex")

  const provided = Buffer.from(signature, "hex")
  const expectedBuffer = Buffer.from(expected, "hex")

  if (
    provided.length !== expectedBuffer.length ||
    !timingSafeEqual(provided, expectedBuffer)
  ) {
    return res.status(401).json({ error: "Invalid identity signature." })
  }

  req.identity = { userId: id, role }
  next()
}
```

Apply it to every route:

```js
app.use(["/users", "/candidates", "/jobs", "/applications", "/saved-jobs",
         "/interviews", "/notifications", "/profiles", "/companies",
         "/admin", "/reports"], verifyHireloopIdentity)
```

> **Important:** the Express app verifies the HMAC envelope above, restricts CORS
> to the configured origins, and enforces authorization/ownership again. The
> Next.js proxy is a convenience and a session check, not a substitute for
> server-side authorization.

### Authorization rules enforced by the Next.js proxy

| Path root                        | Allows                                                        |
| -------------------------------- | ------------------------------------------------------------- |
| `/admin/*`, `/reports/*`         | `admin` only                                                  |
| `/users`, `/users/:id` (`GET`)   | `admin` only                                                  |
| `/candidates*`                   | `recruiter`, `admin`                                          |
| `/saved-jobs*`                   | `seeker` only                                                 |
| `/jobs`, `/job` (`GET`)          | any signed-in role                                            |
| `/jobs`, `/job` (write)          | `recruiter`, `admin`                                          |
| `/applications` (`GET`)          | any signed-in role (Express scopes rows by identity/ownership)|
| `/applications` (`POST`)         | `seeker` only                                                 |
| `/applications/:id` (write)      | any signed-in role (Express enforces ownership/recruiter scope)|
| `/profiles/me*`                  | any signed-in role (always the caller’s own profile)          |
| `/profiles/:id`                  | `admin` only                                                  |
| `/companies` (`GET`)             | any signed-in role                                            |
| `/companies` (write)             | `recruiter`, `admin`                                          |
| `/interviews*`, `/notifications*`| any signed-in role (Express scopes rows by identity/ownership)|

Express must independently enforce the same rules and ownership; the proxy
header is an assertion, not a grant.

## Response and error format

Successful list endpoints should return either a bare array or an object with a
list under `data` / `items` / `results` / `records` / `rows` / `list` / a
resource-named key (e.g. `jobs`). Single resources may be returned bare or
wrapped in `{ "data": { ... } }`.

Errors should use an HTTP status plus:

```json
{ "error": "Human-readable message.", "code": "MACHINE_CODE" }
```

The client maps 401 → `unauthorized`, 403 → `forbidden`, 404 → `not_found`,
5xx → `server`, unreachable/timeout → `network`/`timeout`.

Documented fields below are the canonical names. The client normalizer also
accepts common aliases (`_id`/`id`, `created_at`/`createdAt`, nested
`company`/`recruiter`/`seeker` objects). ISO-8601 strings are expected for every
date; implementers should not send local-time strings.

---

## Endpoints used by the dashboard

### Users (`GET /users`)

Admin-only. Returns every account.

```json
[
  {
    "_id": "665f…",
    "name": "Ayesha Rahman",
    "email": "ayesha@example.com",
    "image": null,
    "role": "seeker",
    "status": "active",
    "emailVerified": true,
    "createdAt": "2026-01-12T09:00:00.000Z",
    "updatedAt": "2026-02-01T10:00:00.000Z",
    "headline": "Product Designer",
    "location": "Dhaka, Bangladesh",
    "companyName": null
  }
]
```

Required per row: `_id` (or `id`), `name`, `email`, `role`, `status`.
Missing dates must be `null`, not `""`.

### Candidates (`GET /candidates`)

Recruiter/admin. Query: `search` (string), `limit` (number).
Returns an array of user objects shaped like `/users` (seekers only). The
client renders name, avatar, headline, email, location, company name.

### Jobs

`GET /jobs`

Query parameters:

| Param    | Values                                    | Meaning                                  |
| -------- | ----------------------------------------- | ---------------------------------------- |
| `scope`  | `all` \| `mine`                           | `mine` = caller’s postings.              |
| `search` | string                                    | Title/company/location/category search.  |
| `status` | `draft`\|`pending`\|`active`\|`paused`\|`closed`\|`rejected`\|`suspended` | Filter by status. |
| `page`   | number (1-based)                          | Pagination.                              |
| `limit`  | number                                    | Page size.                               |

`GET /jobs/recommended` — seeker. Returns matched jobs (same shape). No query
required.

`GET /jobs/:id` — any signed-in role.

`POST /jobs` — recruiter/admin. Body:

```json
{
  "title": "Senior Frontend Engineer",
  "location": "Remote",
  "type": "full-time",
  "category": "Engineering",
  "salaryMin": 90000,
  "salaryMax": 130000,
  "salaryCurrency": "USD",
  "description": "…at least 20 characters…",
  "requirements": ["React", "TypeScript"],
  "deadline": "2026-12-31"
}
```

`PATCH /jobs/:id` — recruiter/admin, owner or admin. Same body fields optional,
plus `status`. Used for edit and for pause/close/publish moderation.

`DELETE /jobs/:id` — recruiter/admin, owner or admin. Returns `204`/`200`.

Job representation:

```json
{
  "_id": "…",
  "title": "Senior Frontend Engineer",
  "companyId": "…",
  "companyName": "Acme",
  "companyLogo": null,
  "recruiterId": "…",
  "location": "Remote",
  "type": "full-time",
  "category": "Engineering",
  "salaryMin": 90000,
  "salaryMax": 130000,
  "salaryCurrency": "USD",
  "description": "…",
  "requirements": ["React"],
  "status": "active",
  "applicantsCount": 12,
  "postedAt": "2026-03-01T08:00:00.000Z",
  "deadline": "2026-12-31T00:00:00.000Z",
  "createdAt": "2026-03-01T08:00:00.000Z",
  "updatedAt": "2026-03-02T08:00:00.000Z",
  "saved": false
}
```

`applicantsCount` is required for recruiter/admin tables; if omitted the client
shows `0` only where it can count nothing else, so return a real count.

### Applications

`GET /applications`

Query:

| Param    | Values                                                            | Meaning                                             |
| -------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| `scope`  | `mine` \| `recruiter` \| `all`                                    | `mine` = seeker’s own; `recruiter` = jobs they own; `all` = admin. |
| `status` | `pending`\|`reviewed`\|`shortlisted`\|`interview`\|`hired`\|`rejected`\|`withdrawn` | Filter. |
| `search` | string                                                            | Optional search.                                    |
| `page` / `limit` | number                                                    | Pagination.                                         |

`POST /applications` — seeker. Body `{ "jobId": "…", "coverLetter": "…" }`.
Express must reject duplicate applications and closed/expired jobs.

`PATCH /applications/:id` — recruiter/admin (and seeker for withdrawal via
`DELETE`). Body `{ "status": "shortlisted" }`. Only pipeline transitions are
allowed (`pending → reviewed → shortlisted → interview → hired`, plus
`rejected`); Express validates the transition and ownership.

`DELETE /applications/:id` — seeker withdrawing their own application, or
admin. Must not hard-delete recruiter records silently; prefer setting
`status: "withdrawn"` for seekers.

Application representation:

```json
{
  "_id": "…",
  "jobId": "…",
  "jobTitle": "Senior Frontend Engineer",
  "companyName": "Acme",
  "companyLogo": null,
  "seekerId": "…",
  "seekerName": "Ayesha Rahman",
  "seekerEmail": "ayesha@example.com",
  "seekerAvatar": null,
  "seekerHeadline": "Product Designer",
  "seekerSkills": ["React"],
  "seekerExperienceYears": 5,
  "status": "pending",
  "resumeUrl": "https://…",
  "coverLetter": "…",
  "appliedAt": "2026-03-03T08:00:00.000Z",
  "updatedAt": "2026-03-04T08:00:00.000Z"
}
```

### Saved jobs

`GET /saved-jobs` — seeker. Array of `{ "_id": "…", "job": { job }, "savedAt": "…" }`
or an array of jobs with `saved: true`. The client accepts either.

`POST /saved-jobs` — seeker. Body `{ "jobId": "…" }`. Idempotent; return the
saved row.

`DELETE /saved-jobs/:jobId` — seeker. Removes the bookmark.

### Interviews

`GET /interviews`

Query: `scope` = `mine` \| `recruiter` \| `all`, `upcoming` = `"true"`.

`POST /interviews` — recruiter/admin. Body:

```json
{
  "applicationId": "…",
  "jobId": "…",
  "candidateId": "…",
  "scheduledAt": "2026-04-01T14:00:00.000Z",
  "durationMinutes": 45,
  "type": "video",
  "meetingLink": "https://meet.google.com/…",
  "location": "…",
  "notes": "…"
}
```

`PATCH /interviews/:id` — recruiter/admin, owner or admin. Body
`{ "status": "completed" | "cancelled" | "rescheduled" }` (other reschedule
fields may be included).

Interview representation:

```json
{
  "_id": "…",
  "applicationId": "…",
  "jobId": "…",
  "jobTitle": "Senior Frontend Engineer",
  "companyName": "Acme",
  "companyLogo": null,
  "candidateId": "…",
  "candidateName": "Ayesha Rahman",
  "candidateAvatar": null,
  "recruiterId": "…",
  "recruiterName": "Rafiq Hasan",
  "scheduledAt": "2026-04-01T14:00:00.000Z",
  "durationMinutes": 45,
  "type": "video",
  "status": "scheduled",
  "meetingLink": "https://…",
  "location": null,
  "notes": "…",
  "createdAt": "2026-03-20T08:00:00.000Z"
}
```

### Notifications

`GET /notifications` — caller’s notifications, newest first.

`PATCH /notifications/:id/read` — mark one as read.

`PATCH /notifications/read-all` — mark every notification for the caller as
read. Returns `204`/`200`.

Notification representation:

```json
{
  "_id": "…",
  "title": "Application shortlisted",
  "message": "Acme moved your application to Shortlisted.",
  "type": "application",
  "read": false,
  "href": "/dashboard/seeker/applications",
  "createdAt": "2026-03-05T08:00:00.000Z"
}
```

`type` is one of `application`, `interview`, `job`, `system`.

### Profiles

`GET /profiles/me` — the caller’s profile.

`PUT /profiles/me` — create/update the caller’s profile. Body:

```json
{
  "headline": "Product Designer",
  "bio": "…",
  "location": "Dhaka, Bangladesh",
  "phone": "+880…",
  "website": "https://…",
  "skills": ["Figma", "React"],
  "experience": [
    {
      "id": "…",
      "company": "Acme",
      "title": "Product Designer",
      "location": "Remote",
      "startDate": "2021-01-01",
      "endDate": null,
      "current": true,
      "description": "…"
    }
  ],
  "education": [
    {
      "id": "…",
      "school": "University of Dhaka",
      "degree": "BSc",
      "fieldOfStudy": "Computer Science",
      "startDate": "2016-01-01",
      "endDate": "2020-01-01"
    }
  ]
}
```

`POST /profiles/me/resume` — `multipart/form-data` with a `resume` file
(PDF/DOC/DOCX, ≤ 5 MB). Returns the updated profile or at least
`{ "resumeUrl": "…", "resumeName": "…" }`.

`DELETE /profiles/me/resume` — removes the file.

Profile representation:

```json
{
  "_id": "…",
  "userId": "…",
  "headline": "Product Designer",
  "bio": "…",
  "location": "Dhaka, Bangladesh",
  "phone": "+880…",
  "website": "https://…",
  "skills": ["Figma"],
  "education": [],
  "experience": [],
  "resumeUrl": "https://…",
  "resumeName": "cv.pdf",
  "avatarUrl": null,
  "updatedAt": "2026-03-06T08:00:00.000Z"
}
```

### Companies

`GET /companies/me` — recruiter’s company profile.

`PUT /companies/me` — create/update. Body:

```json
{
  "name": "Acme",
  "website": "https://acme.com",
  "industry": "Software",
  "size": "51–200 employees",
  "location": "Dhaka, Bangladesh",
  "description": "…"
}
```

Company representation: `{ "_id", "name", "logo", "website", "industry",
"size", "location", "description", "ownerId" }`.

### Admin

`GET /admin/stats` — optional aggregate counts. Shape:
`{ "users": 0, "seekers": 0, "recruiters": 0, "admins": 0, "jobs": 0, "applications": 0, "openReports": 0 }`.

`GET /admin/analytics` — optional. Shape:

```json
{
  "userRegistrationTrend": [{ "month": "2026-01", "value": 12 }],
  "jobPostingTrend": [{ "month": "2026-01", "value": 4 }],
  "applicationActivity": [{ "month": "2026-01", "value": 30 }],
  "roleDistribution": [{ "name": "seeker", "value": 20 }],
  "jobStatusDistribution": [{ "name": "active", "value": 8 }]
}
```

When this endpoint is unavailable the client derives charts from
`/users`, `/jobs`, and `/applications` — no values are invented.

`GET /admin/reports` — moderation queue.

`PATCH /admin/reports/:id` — body `{ "status": "reviewing" | "resolved" | "dismissed" }`.

Report representation:

```json
{
  "_id": "…",
  "targetType": "job",
  "targetId": "…",
  "targetName": "Senior Frontend Engineer",
  "reason": "Misleading salary",
  "details": "…",
  "status": "open",
  "reporterId": "…",
  "reporterName": "Ayesha Rahman",
  "createdAt": "2026-03-07T08:00:00.000Z",
  "resolvedAt": null
}
```

## Admin account mutations (Next.js-owned, not Express)

Better Auth and MongoDB own accounts, so these live in
`app/api/admin/users/[id]/route.ts` and are called same-origin by the admin UI:

| Method   | Path                    | Body / Result                                                |
| -------- | ----------------------- | ------------------------------------------------------------ |
| `GET`    | `/api/admin/users/:id`  | Returns the account projection.                               |
| `PATCH`  | `/api/admin/users/:id`  | `{ "role": "seeker" }` or `{ "status": "suspended" }`.        |
| `DELETE` | `/api/admin/users/:id`  | Deletes the user, their sessions, and their account records.  |

They are admin-only and enforce:

- the caller must be an `admin` and not suspended;
- an admin cannot demote or suspend themselves;
- the last remaining admin cannot be demoted or deleted;
- role/status values are validated against the shared enums;
- deletion cascades `session` and `account` records for that user.

## Ownership rules (Express must enforce)

- Seekers only read/write their own applications, saved jobs, profile, resume,
  notifications, and interviews where they are the candidate.
- Recruiters only read/update jobs they own and applications/interviews for those
  jobs. They may read seeker contact details only when that seeker applied to one
  of their jobs (or via `/candidates`, which is recruiter-scoped).
- Admins may read all records and mutate jobs, applications, reports, and
  accounts.
- A signed identity is never sufficient on its own: always re-check the resource
  owner (`recruiterId`, `seekerId`, `ownerId`) against `req.identity.userId`.

## CORS and credentials

- Browser traffic is same-origin (`/api/backend/*`), so the proxy does not
  require CORS from Express.
- Server Components call Express directly; no cookies are forwarded, so the
  HMAC envelope is the only credential.
- If Express is ever called directly from a browser, set
  `cors({ origin: "https://app.hireloop.example", credentials: true })` — never
  `cors()` with a wildcard alongside credentials.
- Enable rate limiting on auth-adjacent and write endpoints.

## Current implementation status

The Express app at `C:\WebServers\hireloop-server` is implemented in a single
`index.js` file. It verifies the HMAC identity envelope on every protected
route, checks the caller's database role/status, and enforces ownership.

| Area                 | Endpoints                                                           |
| -------------------- | ------------------------------------------------------------------- |
| Health               | `GET /`, `GET /health`                                               |
| Users                | `GET /users`, `GET /users/:id`                                       |
| Candidates           | `GET /candidates`                                                    |
| Jobs                 | `GET /jobs`, `GET /jobs/recommended`, `GET/PATCH/DELETE /jobs/:id`, `POST /jobs` |
| Applications         | `GET/POST /applications`, `GET/PATCH/DELETE /applications/:id`        |
| Saved jobs           | `GET/POST /saved-jobs`, `DELETE /saved-jobs/:jobId`                  |
| Interviews           | `GET/POST /interviews`, `GET/PATCH/DELETE /interviews/:id`           |
| Notifications        | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `DELETE /notifications/:id` |
| Profiles             | `GET/PUT /profiles/me`, `POST/DELETE /profiles/me/resume`, `GET /profiles/:id` |
| Companies            | `GET /companies`, `GET/PUT/DELETE /companies/me`                     |
| Admin                | `GET /admin/stats`, `GET /admin/analytics`, `GET /admin/users/:id`, `GET/POST /admin/reports`, `GET/PATCH/DELETE /admin/reports/:id` |

MongoDB collections used: `user`, `session`, `account`, `job`, `application`,
`profile`, `company`, `savedJob`, `interview`, `notification`, `report`.

Resume files are stored under `uploads/` and served from `/uploads/<file>`.
`PUBLIC_BASE_URL` controls the absolute URL stored on the profile.

The client keeps its honest failure states for any request the API cannot
complete; no mock data or hardcoded API origins are used.
