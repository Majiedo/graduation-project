import { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { database } from "./database";
import { Resend } from "resend";
import axios from "axios";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      let ip = info.remote.address;
      if (ip && ip.startsWith("::ffff:")) {
        ip = ip.split(":").pop();
      }
      await database.collection("blacklist").insertOne({
        ip,
        reason: "SQL Injection attempt",
        timestamp: new Date(),
      });

      const response = await axios.get(`http://ip-api.com/json/${ip}`);

      const { country, city, countryCode } = response.data;

      const flag = countryCode
        ? String.fromCodePoint(
            ...[...countryCode.toUpperCase()].map(
              (c) => 127397 + c.charCodeAt(),
            ),
          )
        : null;

      await database.collection("logs").insertOne({
        serverID: process.env.SERVER_ID,
        type: "sql-injection",
        message: "Potential SQL Injection detected.",
        attacker: {
          ip,
          country,
          city,
          flag,
        },
        timestamp: new Date(),
      });
      sendEmail("sql-injection", "Potential SQL Injection detected.");
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
      let ip = info.remote.address;
      if (ip && ip.startsWith("::ffff:")) {
        ip = ip.split(":").pop();
      }
      await database.collection("blacklist").insertOne({
        ip,
        reason: "XSS attack detected",
        timestamp: new Date(),
      });

      const response = await axios.get(`http://ip-api.com/json/${ip}`);

      const { country, city, countryCode } = response.data;

      const flag = countryCode
        ? String.fromCodePoint(
            ...[...countryCode.toUpperCase()].map(
              (c) => 127397 + c.charCodeAt(),
            ),
          )
        : null;

      await database.collection("logs").insertOne({
        serverID: process.env.SERVER_ID,
        type: "xss",
        message: "Potential XSS detected.",
        attacker: {
          ip,
          country,
          city,
          flag,
        },
        timestamp: new Date(),
      });
      sendEmail("xss", "Potential XSS detected.");
      return true;
    }
  }
  return false;
}

export const sendEmail = async (
  type: "xss" | "sql-injection" | "dos",
  message: string,
) => {
  const adminEmail = process.env.RESEND_EMAIL_ADMIN;
  if (adminEmail === undefined) {
    console.error("RESEND_EMAIL_ADMIN is not set");
    return;
  }

  const { error } = await resend.emails.send({
    from: "System Log <system@teamcrafter.co>",
    to: [adminEmail],
    subject: "report of attack on system",
    html: `<p>There is a new ${type} attack detected on the system.</p><p>${message}</p> <p>Please check the logs for more details.</p> happened on ${new Date()}`,
    text: `There is a new ${type} attack detected on the system. ${message} happened on ${new Date()}`,
  });
  if (error) {
    console.error(error);
  }

  console.log("Email sent successfully");
};

export { hasSQLInjection, hasXSS };
