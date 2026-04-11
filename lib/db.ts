import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Keeping the helper export to ensure all API routes continue to work
export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
