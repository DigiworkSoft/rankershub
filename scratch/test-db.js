const fs = require('fs');
const { Pool } = require('pg');

// Manually parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const dbUrl = env.DATABASE_URL;
console.log('Testing connection with URL:', dbUrl?.replace(/:[^:]+@/, ':****@'));

const pool = new Pool({
  connectionString: dbUrl,
  connectionTimeoutMillis: 5000,
});

async function test() {
  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('Connection successful!');
    const res = await client.query('SELECT NOW(), current_database(), current_user');
    console.log('Database Info:', res.rows[0]);
    
    // Check for tables
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in public schema:', tables.rows.map(r => r.table_name).join(', ') || 'NONE');
    client.release();
  } catch (err) {
    console.error('Connection error details:', err.message);
    if (err.message.includes('password authentication failed')) {
        console.error('HINT: The password in .env.local ("tiger"?) might be incorrect.');
    } else if (err.message.includes('database "rankershub" does not exist')) {
        console.error('HINT: You need to create the database: CREATE DATABASE rankershub;');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('HINT: PostgreSQL server is not running on localhost:5432.');
    }
  } finally {
    await pool.end();
  }
}

test();
