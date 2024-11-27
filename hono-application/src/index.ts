import { Hono } from "hono";
import { logger } from "hono/logger";
import { hasMaliciousPayload } from "./middlewares/detections";
import { isBlacklisted } from "./middlewares/blacklist";
import { client, database } from "./database";
import { openAi } from "./open-ai";
import { ObjectId } from "mongodb";
import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";
import axios from "axios";
import { sendEmail } from "./helpers";

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    const { id } = c.req.query();
    if (!id) return Math.random().toString();
    return id;
  },
  handler: async (c) => {
    const info = getConnInfo(c);
    const ip = info.remote.address;
    await database.collection("blacklist").insertOne({
      ip,
      type: "ddos",
      timestamp: new Date(),
    });

    const response = await axios.get(`http://ip-api.com/json/${ip}`);

    const { country, city, countryCode } = response.data;

    const flag = countryCode
      ? String.fromCodePoint(
          ...[...countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt()),
        )
      : null;

    await database.collection("logs").insertOne({
      serverID: process.env.SERVER_ID,
      type: "DDOS",
      message: "DDOS attack detected.",
      attacker: {
        ip,
        country,
        city,
        flag,
      },
      timestamp: new Date(),
    });
    sendEmail("ddos", "DDOS attack detected.");
    return c.json({ message: "you're rated limited" }, { status: 403 });
  },
});

const app = new Hono();

app.use(limiter);

app.use(logger());

app.use(async (c, next) => {
  await client.connect();
  return next();
});

app.use(isBlacklisted);

app.use(hasMaliciousPayload);

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

app.get("/api/logs", async (c) => {
  const { prompt } = c.req.query();
  if (prompt) {
    const logs = await database.collection("logs").find({}).toArray();
    const AIResponse = await openAi.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "filter these objects of logs based on the prompt user give in output JSON. don't change the format of the output. or keys",
        },
        {
          role: "user",
          content: `logs: ${JSON.stringify(logs)}\prompt: ${prompt}`,
        },
      ],
      model: "gpt-3.5-turbo",
      response_format: {
        type: "json_object",
      },
    });

    return c.json({
      message: "success",
      logs: AIResponse.choices[0].message.content
        ? JSON.parse(AIResponse.choices[0].message.content).logs
        : [],
    });
  }
  const logs = await database.collection("logs").find({}).toArray();
  return c.json({ message: "success", logs });
});

app.get("/api/blacklist", async (c) => {
  const blacklist = await database.collection("blacklist").find({}).toArray();
  return c.json({ message: "success", blacklist });
});

app.delete("/api/blacklist/:id", async (c) => {
  const id = c.req.param("id");
  await database.collection("blacklist").deleteOne({ _id: new ObjectId(id) });
  const blacklist = await database.collection("blacklist").find({}).toArray();
  return c.json({ message: "success", blacklist });
});

app.post("/api/blacklist", async (c) => {
  const body = await c.req.json();
  const ip = body.ip;
  const type = body.type;
  await database
    .collection("blacklist")
    .insertOne({ ip, type, timestamp: new Date() });
  const blacklist = await database.collection("blacklist").find({}).toArray();
  return c.json({ message: "success", blacklist });
});

const cleanup = () => {
  client.close();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
