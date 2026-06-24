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
    // Update defaults
    await client.query(`
      ALTER TABLE courses ALTER COLUMN mode_of_learning SET DEFAULT 'Offline (Hybrid )';
      ALTER TABLE fee_plans ALTER COLUMN mode_of_learning SET DEFAULT 'Offline (Hybrid )';
    `);

    // Update existing course table records
    await client.query(`
      UPDATE courses SET mode_of_learning = 'Offline (Hybrid )' WHERE mode_of_learning = 'offline (Hybrid )';
      UPDATE courses SET mode_of_learning = 'Recorded' WHERE mode_of_learning = 'recorded';
    `);

    // Update existing fee plans table records
    await client.query(`
      UPDATE fee_plans SET mode_of_learning = 'Offline (Hybrid )' WHERE mode_of_learning = 'offline (Hybrid )';
      UPDATE fee_plans SET mode_of_learning = 'Recorded' WHERE mode_of_learning = 'recorded';
    `);

  } catch {
    // Fail silently
  } finally {
    await client.end();
  }
}

run();
