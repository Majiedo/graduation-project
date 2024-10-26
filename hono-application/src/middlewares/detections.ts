import { Context, Next } from "hono";
import { hasSQLInjection, hasXSS } from "../helpers";

export async function hasMaliciousPayload(context: Context, next: Next) {
  // const queries = context.req.queries("tags");
  let body: string[];
  try {
    body = Object.values(await context.req.json());
  } catch (error) {
    body = [];
  }

  const queries = Object.values(context.req.queries()).flat();
  for (let value of [...queries, ...body]) {
    if (await hasSQLInjection(value, context)) {
      return context.json(
        { message: "Sql Injection detected." },
        { status: 400 },
      );
    }
    if (await hasXSS(value, context)) {
      return context.json({ message: "XSS detected." }, { status: 400 });
    }
  }
  return next();
}
