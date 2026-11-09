import { MongoClient } from "mongodb"

const MONGO_DB_NAME = process.env.MONGO_DB_NAME ?? "hireloopdb"

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient
}

export function getMongoClient(): MongoClient {
  const uri = process.env.MONGO_DB_URI

  if (!uri) {
    throw new Error(
      "MONGO_DB_URI is not set. Add it to .env before starting the auth server."
    )
  }

  globalForMongo.mongoClient ??= new MongoClient(uri)
  return globalForMongo.mongoClient
}

export function getDatabase() {
  return getMongoClient().db(MONGO_DB_NAME)
}
