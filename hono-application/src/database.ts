import { MongoClient, ServerApiVersion } from "mongodb";

export const client = new MongoClient(process.env.DATABASE_URL ?? "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const database = client.db("api-application");
