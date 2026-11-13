<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Commands

```bash
npm run dev        # next dev
npm run build      # next build
npm run lint       # eslint (no paths = whole repo)
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write "**/*.{ts,tsx}"
```

- No test script, test runner, CI workflow, or `.env.example` exists. Do not invent test commands.
- Verify in this order before finishing: `npm run lint && npm run typecheck && npm run build`.

# Structure

- Single-package Next.js 16 (App Router) app + React 19 + Tailwind 4. No monorepo, no workspace.
- Entrypoints: `app/layout.tsx` (fonts + `ThemeProvider`), `app/page.tsx`, `app/globals.css`.
- `lib/auth.ts` is an empty Better Auth stub (`betterAuth({})`) and is not wired anywhere yet; `@better-auth/mongo-adapter` and `mongodb` are installed but unused. Don't assume a working auth flow.
- `hooks/` contains only `.gitkeep` despite the `@/hooks` alias in `components.json`.
- Path alias: `@/*` maps to repo root (`./`), so use `@/lib/utils`, `@/components/ui/button`, etc.

# Conventions (non-default)

- Prettier: no semicolons, double quotes, 2-space, 80 cols, LF, `trailingComma: es5`. Tailwind class sorting is automatic via `prettier-plugin-tailwindcss` (functions `cn`, `cva`); run `npm run format` instead of hand-sorting classes.
- `cn` is re-exported from the `cn` package via `lib/utils.ts` (`export { cn } from "cn"`). Import from `@/lib/utils` — do not add another `clsx`/`tailwind-merge` implementation.
- Styling is Tailwind 4 (CSS-first, no `tailwind.config`); shadcn style `base-nova`, RSC on, icons via `lucide-react`. Theming tokens live in `app/globals.css` (`@theme inline` + `:root` / `.dark`). New ui components: `npx shadcn@latest add <name>`, output `components/ui/`.
- `components/theme-provider.tsx` is a client component (`"use client"`) bound to `next-themes`; root layout sets `suppressHydrationWarning` on `<html>`. Keep that pair intact.
- `CLAUDE.md` is just `@AGENTS.md` — edit only this file.

# Env

- `.env` is gitignored and is the only env file: do not add `.env.local` or other per-environment files. `lib/auth.ts` needs `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (matching `better-auth`); builds that import `lib/auth.ts` will fail without them. Stripe needs `STRIPE_SECRET_KEY` (server) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Never commit `.env` or print its values.
