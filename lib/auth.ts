import crypto from 'crypto';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_development_only';

export interface AdminPayload {
  id: number;
  username: string;
}

export function signToken(payload: AdminPayload): string {
  // Always use a secret for signing
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

// Utility to generate a secure secret if needed (informative)
export function generateSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}
