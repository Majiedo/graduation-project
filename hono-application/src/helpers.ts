import { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { database } from "./database";

async function hasSQLInjection(input: string, c: Context) {
  const sqlInjectionPatterns = [
    // Basic SQL injection patterns
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,

    // UNION and SELECT detection
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i, // e.g., ' UNION
    /((\%27)|(\'))select/i, // e.g., ' SELECT

    // Stack queries
    /((\%3B)|(;))/i,

    // Comments
    /((\%2D)|(-)){2}/i,

    // Hex-encoded characters
    /((\%27)|(\'))0x[0-9a-fA-F]*/i, // e.g., '0x27

    // Out-of-band retrieval
    /(exec|xp_cmdshell|response\.write)/i, // e.g., EXEC XP_CMDSHELL

    // Time-delay techniques (database dependent)
    /(waitfor\s+delay|benchmark|pg_sleep|sleep)/i, // e.g., WAITFOR DELAY

    // Other SQL keywords and commands
    /((\%27)|(\'))\s*(or|and)\s*((\%27)|(\'))/i, // e.g., ' OR '
    /(drop(\s+)?table|show(\s+)?tables|--|declare|truncate|delete|update|remove)/i, // e.g., DROP TABLE
  ];

  for (let pattern of sqlInjectionPatterns) {
    if (pattern.test(input)) {
      const info = getConnInfo(c);
      const ip = info.remote.address;
      await database.collection("blacklist").insertOne({
        ip,
        type: "sql-injection",
        timestamp: new Date(),
      });
      await database.collection("logs").insertOne({
        type: "sql-injection",
        message: "Potential SQL Injection detected.",
        attacker: {
          ip,
          country: "Saudi Arabia",
          region: "Riyadh",
          city: "Riyadh",
        },
        timestamp: new Date(),
      });
      return true;
    }
  }
  return false;
}

async function hasXSS(input: string, c: Context) {
  const xssPatterns = [
    // Basic XSS patterns
    /<(script|iframe|style)/i,
    /(on\w+)?=("|').*script/i,
    /script(\s+)?type(\s+)?=/i,
    /script(\s+)?language(\s+)?=/i,
    /vbscript:(.*)/i,
    /data:(text\/html|application\/xhtml\+xml)/i,

    // Event handlers
    /(on\w+)?=("|').*javascript:/i,
    /(on\w+)?=("|')alert\(/i,
    /(on\w+)?=("|')prompt\(/i,
    /(on\w+)?=("|')confirm\(/i,

    // HTML tags
    /<.*>/i,
  ];
  for (let pattern of xssPatterns) {
    if (pattern.test(input)) {
      const info = getConnInfo(c);
      const ip = info.remote.address;
      await database.collection("blacklist").insertOne({
        ip,
        type: "xss",
        timestamp: new Date(),
      });
      await database.collection("logs").insertOne({
        type: "xss",
        message: "Potential XSS detected.",
        attacker: {
          ip,
          country: "Saudi Arabia",
          region: "Riyadh",
          city: "Riyadh",
        },
        timestamp: new Date(),
      });
      return true;
    }
  }
  return false;
}

export { hasSQLInjection, hasXSS };
