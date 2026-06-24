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
    await client.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        desktop_image_url TEXT NOT NULL,
        mobile_image_url TEXT NOT NULL,
        page TEXT NOT NULL, -- 'index' or 'batches'
        is_active BOOLEAN DEFAULT TRUE,
        ranking INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Check if banners table is empty, if so, seed default banners
    const countCheck = await client.query("SELECT COUNT(*)::int AS count FROM banners;");
    const count = countCheck.rows[0].count;
    if (count === 0) {
      await client.query(`
        INSERT INTO banners (title, desktop_image_url, mobile_image_url, page, ranking, is_active) VALUES
        ('Default Home Banner', '/assets/photos/banner.webp', '/assets/photos/banner2.webp', 'index', 1, TRUE),
        ('Default Batches Banner', '/assets/photos/batch.webp', '/assets/photos/batch2.webp', 'batches', 1, TRUE);
      `);
    }
  } catch {
    // Fail silently
  } finally {
    await client.end();
  }
}

run();
