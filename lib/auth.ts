import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"
import { createHash, timingSafeEqual } from "node:crypto"

import { isUserRole, USER_ROLES } from "@/lib/roles"

const MONGO_DB_NAME = process.env.MONGO_DB_NAME ?? "hireloopdb"

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

/**
 * Reuse one MongoClient across dev hot reloads. Next.js re-evaluates modules
 * on every change, and a fresh client per reload leaks connections until
 * MongoDB refuses new ones.
 */
const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient
}

function getMongoClient() {
  const uri = process.env.MONGO_DB_URI

  if (!uri) {
    throw new Error(
      "MONGO_DB_URI is not set. Add it to .env before starting the auth server."
    )
  }

  globalForMongo.mongoClient ??= new MongoClient(uri)
  return globalForMongo.mongoClient
}

const client = getMongoClient()
const db = client.db(MONGO_DB_NAME)

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
