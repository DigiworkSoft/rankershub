const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is 10MB.` };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { valid: false, error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.` };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Invalid file extension ".${ext}". Allowed: jpg, jpeg, png, webp, gif.` };
  }

  return { valid: true };
}

export function sanitizeFilename(prefix: string, originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : "jpg";
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
}
