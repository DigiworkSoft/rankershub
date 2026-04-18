import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pool?: Pool };

const pool = globalForPg.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.pool = pool;
}

// Keeping the helper export to ensure all API routes continue to work
export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
