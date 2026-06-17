import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const BUCKET = "uploads";

export async function uploadFile(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (supabase) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType, upsert: true });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  }

  // Local storage fallback for local development when Supabase keys are not set
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err: any) {
    throw new Error(`Local file storage upload failed: ${err.message}`);
  }
}
