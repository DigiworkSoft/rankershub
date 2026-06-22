const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('DATABASE_URL=')) {
      databaseUrl = line.split('=')[1].trim();
      break;
    }
  }
}

if (!databaseUrl) {
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

async function run() {
  const sqlPath = path.join(__dirname, 'migration-course-enhancements.sql');
  if (!fs.existsSync(sqlPath)) {
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
  } catch (err) {
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
