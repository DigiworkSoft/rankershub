import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query("SELECT id, name, email, role, created_at FROM users");
    return Response.json(result.rows);
  } catch (err: any) {
    if (err.code === '42P01') {
      return Response.json({ error: "Table 'users' does not exist in your local database." }, { status: 404 });
    }
    console.error("Users fetch error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
