import crypto from 'crypto';
import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set. Refusing to start with an insecure default.");
  }
  return secret;
}

export interface AdminPayload {
  id: number;
  username: string;
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "12h" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AdminPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  // Check Authorization header first
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  // Check httpOnly cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/admin_token=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}

// Utility to generate a secure secret if needed (informative)
export function generateSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}
