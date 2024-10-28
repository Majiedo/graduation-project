import { database, client } from "./src/database";

async function main() {
  client.connect();
  await database.collection("logs").deleteMany({});
  await database.collection("blacklist").deleteMany({});
  client.close();
  console.log("Database cleared successfully");
}

main();
