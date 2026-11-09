import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { createHash, timingSafeEqual } from "node:crypto"

import { isUserRole, USER_ROLES } from "@/lib/roles"
import { getDatabase, getMongoClient } from "@/lib/server/mongodb"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isValidAdminInviteCode(value: unknown) {
  const expectedCode = process.env.ADMIN_SIGNUP_INVITE_CODE

  if (typeof value !== "string" || !expectedCode) {
    return false
  }

  const providedHash = createHash("sha256").update(value).digest()
  const expectedHash = createHash("sha256").update(expectedCode).digest()

  return timingSafeEqual(providedHash, expectedHash)
}

const client = getMongoClient()
const db = getDatabase()

const github =
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : undefined

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: [...USER_ROLES],
        required: false,
        defaultValue: "seeker",
        input: true,
      },
      /**
       * Account moderation state. Never accepted from client input; only the
       * server-side admin route may change it.
       */
      status: {
        type: ["active", "suspended"],
        required: false,
        defaultValue: "active",
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        async before(user, context) {
          if (context?.path !== "/sign-up/email") {
            if (user.role !== undefined && user.role !== "seeker") {
              throw APIError.from("BAD_REQUEST", {
                code: "INVALID_SIGNUP_ROLE",
                message: "Invalid signup role.",
              })
            }

            return
          }

          if (!isRecord(context.body)) {
            return
          }

          const requestedRole = context.body.role

          if (requestedRole === undefined) {
            return
          }

          if (!isUserRole(requestedRole)) {
            throw APIError.from("BAD_REQUEST", {
              code: "INVALID_SIGNUP_ROLE",
              message: "Invalid signup role.",
            })
          }

          if (
            requestedRole === "admin" &&
            !isValidAdminInviteCode(context.body.adminInviteCode)
          ) {
            throw APIError.from("BAD_REQUEST", {
              code: "INVALID_ADMIN_INVITE",
              message: "A valid admin invite code is required.",
            })
          }

          return {
            data: {
              ...user,
              role: requestedRole,
            },
          }
        },
      },
      update: {
        async before(user) {
          if (Object.prototype.hasOwnProperty.call(user, "role")) {
            throw APIError.from("BAD_REQUEST", {
              code: "ROLE_CHANGE_NOT_ALLOWED",
              message: "Account roles cannot be changed after signup.",
            })
          }
        },
      },
    },
  },

  ...(github ? { socialProviders: github } : {}),
})
