import { Client } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// Auto-load .env.local from project root if DATABASE_URL is not already set
if (!process.env.DATABASE_URL) {
  const envFile = path.join(rootDir, ".env.local");
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const sql = fs.readFileSync(path.join(__dirname, "db-schema.sql"), "utf-8");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const client = new Client({ connectionString });
client.connect()
  .then(() => client.query(sql))
  .then(() => { console.log("Schema applied successfully."); return client.end(); })
  .catch(err => { console.error("Schema apply failed:", err.message); process.exit(1); });
