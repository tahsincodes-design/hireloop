import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"

const MONGO_DB_NAME = process.env.MONGO_DB_NAME ?? "hireloopdb"

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
        type: "string",
        required: false,
        defaultValue: "seeker",
        input: true,
      },
    },
  },

  ...(github ? { socialProviders: github } : {}),
})
