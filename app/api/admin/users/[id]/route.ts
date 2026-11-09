import { ObjectId } from "mongodb"

import { getSessionUser } from "@/lib/auth/session"
import { isUserRole } from "@/lib/roles"
import { getDatabase } from "@/lib/server/mongodb"
import { isUserStatus } from "@/types/user"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function jsonError(message: string, status: number, code?: string) {
  return Response.json(code ? { error: message, code } : { error: message }, {
    status,
  })
}

async function getAdminActor() {
  const user = await getSessionUser()

  if (!user) {
    return {
      response: jsonError("Unauthorized.", 401, "UNAUTHORIZED"),
      user: null,
    }
  }

  if (user.role !== "admin" || user.status === "suspended") {
    return {
      response: jsonError("Administrator access required.", 403, "FORBIDDEN"),
      user: null,
    }
  }

  return { response: null, user }
}

function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) return null
  return new ObjectId(id)
}

function parseBody(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAdminActor()
  if (actor.response) return actor.response

  const { id } = await context.params
  const objectId = toObjectId(id)
  if (!objectId) return jsonError("Invalid user id.", 400, "INVALID_ID")

  const user = await getDatabase()
    .collection("user")
    .findOne(
      { _id: objectId },
      {
        projection: {
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          image: 1,
          createdAt: 1,
          updatedAt: 1,
          emailVerified: 1,
        },
      }
    )

  if (!user) return jsonError("User not found.", 404, "NOT_FOUND")

  return Response.json({ ...user, _id: objectId.toString() })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAdminActor()
  if (actor.response) return actor.response

  const { id } = await context.params
  const objectId = toObjectId(id)
  if (!objectId) return jsonError("Invalid user id.", 400, "INVALID_ID")

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonError("Request body must be valid JSON.", 400, "INVALID_BODY")
  }

  const body = parseBody(payload)
  if (!body) return jsonError("Request body must be an object.", 400)

  const updates: Record<string, unknown> = {}

  if (body.role !== undefined) {
    if (!isUserRole(body.role)) {
      return jsonError("Invalid role.", 400, "INVALID_ROLE")
    }
    updates.role = body.role
  }

  if (body.status !== undefined) {
    if (!isUserStatus(body.status)) {
      return jsonError("Invalid account status.", 400, "INVALID_STATUS")
    }
    updates.status = body.status
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("No supported fields were provided.", 400, "NO_CHANGES")
  }

  if (objectId.toString() === actor.user?.id) {
    if (updates.role !== undefined && updates.role !== "admin") {
      return jsonError(
        "You cannot remove your own administrator role.",
        403,
        "SELF_DEMOTION"
      )
    }
    if (updates.status !== undefined && updates.status === "suspended") {
      return jsonError(
        "You cannot suspend your own account.",
        403,
        "SELF_SUSPEND"
      )
    }
  }

  const users = getDatabase().collection("user")
  const target = await users.findOne({ _id: objectId })

  if (!target) return jsonError("User not found.", 404, "NOT_FOUND")

  if (target.role === "admin" && updates.role && updates.role !== "admin") {
    const remainingAdmins = await users.countDocuments({
      _id: { $ne: objectId },
      role: "admin",
    })

    if (remainingAdmins === 0) {
      return jsonError(
        "Cannot remove the last administrator account.",
        400,
        "LAST_ADMIN"
      )
    }
  }

  updates.updatedAt = new Date()

  const result = await users.findOneAndUpdate(
    { _id: objectId },
    { $set: updates },
    { returnDocument: "after" }
  )

  return Response.json({
    ...(result ?? target),
    _id: objectId.toString(),
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAdminActor()
  if (actor.response) return actor.response

  const { id } = await context.params
  const objectId = toObjectId(id)
  if (!objectId) return jsonError("Invalid user id.", 400, "INVALID_ID")

  if (objectId.toString() === actor.user?.id) {
    return jsonError(
      "You cannot delete your own account while signed in.",
      403,
      "SELF_DELETE"
    )
  }

  const db = getDatabase()
  const users = db.collection("user")
  const target = await users.findOne({ _id: objectId })

  if (!target) return jsonError("User not found.", 404, "NOT_FOUND")

  if (target.role === "admin") {
    const remainingAdmins = await users.countDocuments({
      _id: { $ne: objectId },
      role: "admin",
    })

    if (remainingAdmins === 0) {
      return jsonError(
        "Cannot delete the last administrator account.",
        400,
        "LAST_ADMIN"
      )
    }
  }

  // Better Auth versions have stored `userId` both as an ObjectId and as a
  // string, so remove either representation to avoid orphaned sessions.
  const userIdMatch = { $in: [objectId, objectId.toString()] }

  await Promise.all([
    db.collection("session").deleteMany({ userId: userIdMatch }),
    db.collection("account").deleteMany({ userId: userIdMatch }),
  ])

  await users.deleteOne({ _id: objectId })

  return Response.json({ ok: true, id: objectId.toString() })
}
