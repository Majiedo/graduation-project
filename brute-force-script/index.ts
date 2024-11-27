import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(Bun.env.DATABASE_URL ?? "", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("api-application");

const THRESHOLD = 3;
const TIME_WINDOW = 5 * 60 * 1000;

const failedAttempts: Record<string, number[]> = {};

const journalctlProcess = Bun.spawn(["journalctl", "-u", "sshd", "-f"]);

console.log("Monitoring SSH logs for brute force attacks...");

async function processLogs(stream: ReadableStream<Uint8Array>) {
  client.connect();
  if (!stream) return;

  const decoder = new TextDecoder();

  for await (const chunk of stream) {
    const logLine = decoder.decode(chunk);

    if (logLine.includes("Failed password")) {
      const ipMatch = logLine.match(/from ([0-9.]+)/);
      if (ipMatch) {
        const ip = ipMatch[1];
        const now = Date.now();

        if (!failedAttempts[ip]) {
          failedAttempts[ip] = [];
        }

        failedAttempts[ip].push(now);

        failedAttempts[ip] = failedAttempts[ip].filter(
          (timestamp) => now - timestamp <= TIME_WINDOW,
        );

        if (failedAttempts[ip].length >= THRESHOLD) {
          const response = await fetch(`http://ip-api.com/json/${ip}`);
          const { country, city, countryCode } = await response.json();
          const flag = countryCode
            ? String.fromCodePoint(
                ...[...countryCode.toUpperCase()].map(
                  (c) => 127397 + c.charCodeAt(),
                ),
              )
            : null;
          await database.collection("logs").insertOne({
            serverID: process.env.SERVER_ID,
            type: "brute-force",
            message: `${failedAttempts[ip].length} failed attempts detected.`,
            attacker: {
              ip,
              country,
              city,
              flag,
            },
            timestamp: new Date(),
          });

          // Clear the record to avoid repeated alerts
          failedAttempts[ip] = [];
        }
      }
    }
  }
}

// Process stdout and stderr streams
processLogs(journalctlProcess.stdout);
processLogs(journalctlProcess.stderr);

// Handle process close event
journalctlProcess.exited.then((code) => {
  console.log(`journalctl process exited with code ${code}`);
  client.close();
});
