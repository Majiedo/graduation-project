import { database, client } from "./src/database";

async function main() {
  client.connect();
  // clear logs and blacklist collections
  await database.collection("logs").deleteMany({});
  await database.collection("blacklist").deleteMany({});
  console.log("Database cleared successfully 🎉");

  // add some data to the logs collection
  await database.collection("logs").insertMany([
    {
      serverID: process.env.SERVER_ID,
      type: "xss",
      message: "Potential XSS detected.",
      attacker: {
        ip: "67.215.65.139",
        country: "Saudi Arabia",
        city: "Riyadh",
        flag: "🇸🇦",
      },
      timestamp: new Date(),
    },
    {
      serverID: process.env.SERVER_ID,
      type: "sql-injection",
      message: "Potential SQL Injection detected.",
      attacker: {
        ip: "71.170.207.19",
        country: "Germany",
        city: "Berlin",
        flag: "🇩🇪",
      },
      timestamp: new Date(1479612800000),
    },
    {
      serverID: process.env.SERVER_ID,
      type: "xss",
      message: "Potential XSS detected.",
      attacker: {
        ip: "83.169.230.83",
        country: "Russia",
        city: "Moscow",
        flag: "🇷🇺",
      },
      timestamp: new Date(1679612800000),
    },
  ]);

  // add some data to the blacklist collection
  await database.collection("blacklist").insertMany([
    {
      ip: "67.215.65.139",
      type: "xss",
      timestamp: new Date(),
    },
    {
      ip: "71.170.207.19",
      type: "sql-injection",
      timestamp: new Date(1479612800000),
    },
    {
      ip: "83.169.230.83",
      type: "xss",
      timestamp: new Date(1679612800000),
    },
  ]);

  console.log("Data added successfully 🎉");

  client.close();
  process.exit(0);
}

main();
