export function validateOrigin(request: Request): boolean {
  // Skip check in development
  if (process.env.NODE_ENV !== "production") return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (!origin && !referer) return false;

  const allowedHost = host || process.env.NEXT_PUBLIC_SITE_URL || "";

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return originHost === allowedHost;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return refererHost === allowedHost;
    } catch {
      return false;
    }
  }

  return false;
}
