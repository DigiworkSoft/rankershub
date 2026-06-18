const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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
  const args = process.argv.slice(2);
  const username = args[0] || 'admin';
  const password = args[1] || 'admin123';

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Update if exists, otherwise insert
    const checkRes = await pool.query('SELECT id FROM admins WHERE username = $1', [username]);
    if (checkRes.rows.length > 0) {
      await pool.query('UPDATE admins SET password_hash = $1 WHERE username = $2', [hash, username]);
    } else {
      await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', [username, hash]);
    }
  } catch (err) {
  } finally {
    await pool.end();
  }
}

run();
