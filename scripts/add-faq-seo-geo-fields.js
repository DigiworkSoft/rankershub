const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

function getDatabaseUrl() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local file not found");
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    if (line.trim().startsWith("DATABASE_URL=")) {
      return line.split("DATABASE_URL=")[1].trim();
    }
  }
  throw new Error("DATABASE_URL not found in .env.local");
}

async function run() {
  const dbUrl = getDatabaseUrl();
  const client = new Client({
    connectionString: dbUrl
  });
  await client.connect();
  try {
    const columns = [
      { name: "meta_title", type: "TEXT" },
      { name: "meta_description", type: "TEXT" },
      { name: "geo_region", type: "TEXT" },
      { name: "geo_placename", type: "TEXT" },
      { name: "geo_position", type: "TEXT" },
      { name: "icbm", type: "TEXT" }
    ];

    for (const col of columns) {
      try {
        await client.query(`ALTER TABLE faqs ADD COLUMN ${col.name} ${col.type}`);
      } catch (err) {
        if (err.code !== "42701") {
          throw err;
        }
      }
    }
  } catch {
    // Fail silently
  } finally {
    await client.end();
  }
}

run();
