import { Hono } from "hono";
import { logger } from "hono/logger";
import { hasMaliciousPayload } from "./middlewares/detections";
import { isBlacklisted } from "./middlewares/blacklist";
import { client, database } from "./database";

const app = new Hono();

app.use(logger());

app.use(async (c, next) => {
  await client.connect();
  return next();
});

app.use(isBlacklisted);

app.use(hasMaliciousPayload);

app.post("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

app.get("/api/logs", async (c) => {
  const logs = await database.collection("logs").find({}).toArray();
  return c.json({ message: "success", logs });
});

app.get("/api/blacklist", async (c) => {
  const blacklist = await database.collection("blacklist").find({}).toArray();
  return c.json({ message: "success", blacklist });
});

const cleanup = () => {
  client.close();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

export default app;
