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
    const contentCheck = await client.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='resource_links' AND column_name='content';"
    );
    if (contentCheck.rowCount === 0) {
      await client.query("ALTER TABLE resource_links ADD COLUMN content TEXT;");
    }

    const resMetaCheck = await client.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='resource_links' AND column_name='meta_title';"
    );
    if (resMetaCheck.rowCount === 0) {
      await client.query("ALTER TABLE resource_links ADD COLUMN meta_title TEXT;");
      await client.query("ALTER TABLE resource_links ADD COLUMN meta_description TEXT;");
      await client.query("ALTER TABLE resource_links ADD COLUMN meta_keywords TEXT;");
      await client.query("ALTER TABLE resource_links ADD COLUMN geo_region TEXT;");
      await client.query("ALTER TABLE resource_links ADD COLUMN geo_placename TEXT;");
      await client.query("ALTER TABLE resource_links ADD COLUMN geo_position TEXT;");
      await client.query("ALTER TABLE resource_links ADD COLUMN icbm TEXT;");
    }

    // 2. Alter blogs table
    const blogsMetaCheck = await client.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='meta_title';"
    );
    if (blogsMetaCheck.rowCount === 0) {
      await client.query("ALTER TABLE blogs ADD COLUMN meta_title TEXT;");
      await client.query("ALTER TABLE blogs ADD COLUMN meta_description TEXT;");
      await client.query("ALTER TABLE blogs ADD COLUMN meta_keywords TEXT;");
      await client.query("ALTER TABLE blogs ADD COLUMN geo_region TEXT;");
      await client.query("ALTER TABLE blogs ADD COLUMN geo_placename TEXT;");
      await client.query("ALTER TABLE blogs ADD COLUMN geo_position TEXT;");
      await client.query("ALTER TABLE blogs ADD COLUMN icbm TEXT;");
    }

  } catch {
    // Fail silently
  } finally {
    await client.end();
  }
}

run();
