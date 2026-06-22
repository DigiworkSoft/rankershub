import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { generateCaptchaText, generateCaptchaSvg } from "@/lib/captcha";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_captcha";

export async function GET() {
  try {
    const text = generateCaptchaText(5);
    const svg = generateCaptchaSvg(text);
    
    // Sign the answer (lowercase) into a short-lived token (expires in 5 minutes)
    const token = jwt.sign({ answer: text.toLowerCase() }, JWT_SECRET, { expiresIn: "5m" });
    
    return NextResponse.json({
      svg,
      token
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate captcha" }, { status: 500 });
  }
}
