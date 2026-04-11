import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM users");
    return Response.json(result.rows);
  } catch (err: any) {
    if (err.code === '42P01') { // table "users" does not exist
      return Response.json({ error: "Table 'users' does not exist in your local database." }, { status: 404 });
    }
    console.error("Users fetch error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
