require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("api-application");

module.exports = database;
