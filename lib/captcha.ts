import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_captcha";

export function generateCaptchaText(length = 5): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit confusing characters like I, O, 0, 1
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateCaptchaSvg(text: string): string {
  const width = 150;
  const height = 50;
  
  // Background
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: #f3f4f6; border-radius: 8px;">`;
  
  // Add noise lines
  for (let i = 0; i < 6; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const colors = ["#cbd5e1", "#94a3b8", "#a7f3d0", "#fef08a", "#fed7aa"];
    const stroke = colors[Math.floor(Math.random() * colors.length)];
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${1 + Math.random() * 2}" />`;
  }
  
  // Render text with distortion
  const startX = 15;
  const charSpacing = (width - 30) / text.length;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const x = startX + i * charSpacing + (Math.random() * 6 - 3);
    const y = 35 + (Math.random() * 8 - 4);
    const angle = Math.floor(Math.random() * 40 - 20); // -20 to 20 degrees
    const fontSizes = [24, 26, 28, 30];
    const fontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];
    const colors = ["#4f46e5", "#0891b2", "#0d9488", "#2563eb", "#db2777", "#ea580c"];
    const fill = colors[Math.floor(Math.random() * colors.length)];
    
    svg += `<text x="${x}" y="${y}" fill="${fill}" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" transform="rotate(${angle} ${x} ${y})">${char}</text>`;
  }
  
  // Add noise dots
  for (let i = 0; i < 30; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = 1 + Math.random() * 1.5;
    const colors = ["#cbd5e1", "#94a3b8", "#4f46e5", "#10b981"];
    const fill = colors[Math.floor(Math.random() * colors.length)];
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="0.6" />`;
  }
  
  svg += "</svg>";
  return svg;
}

export function verifyCaptcha(token: string | undefined, answer: string | undefined): boolean {
  if (!token || !answer) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { answer: string };
    return decoded.answer.toLowerCase() === answer.trim().toLowerCase();
  } catch {
    return false;
  }
}
