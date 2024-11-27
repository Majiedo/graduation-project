import { Context, Next } from "hono";
import { getConnInfo } from "hono/bun";
import { database } from "../database";

export async function isBlacklisted(c: Context, next: Next) {
  const info = getConnInfo(c);
  let ip = info.remote.address;
  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.split(":").pop();
  }
  const isBlacklisted = await database.collection("blacklist").findOne({ ip });
  if (isBlacklisted) {
    return c.json({ message: "You are blacklisted." }, { status: 403 });
  }
  return next();
}
