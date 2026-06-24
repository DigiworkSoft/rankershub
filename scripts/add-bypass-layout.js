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
    // 1. Alter resource_links table
    const resCheck = await client.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='resource_links' AND column_name='bypass_layout';"
    );
    if (resCheck.rowCount === 0) {
      await client.query("ALTER TABLE resource_links ADD COLUMN bypass_layout BOOLEAN DEFAULT FALSE;");
    }

    // 2. Alter blogs table
    const blogsCheck = await client.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='bypass_layout';"
    );
    if (blogsCheck.rowCount === 0) {
      await client.query("ALTER TABLE blogs ADD COLUMN bypass_layout BOOLEAN DEFAULT FALSE;");
    }

  } catch {
    // Fail silently
  } finally {
    await client.end();
  }
}

run();
