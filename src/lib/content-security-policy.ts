export function createContentSecurityPolicy(nonce?: string): string {
  let apiOrigin = "";
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicApiUrl && !publicApiUrl.startsWith("/")) {
    try { apiOrigin = new URL(publicApiUrl).origin; } catch { /* Invalid config adds no origin. */ }
  }

  return [
    "default-src 'self'",
    // Only server-rendered scripts with this request's nonce may run inline.
    `script-src 'self'${nonce ? ` 'nonce-${nonce}'` : ""}${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
    "font-src 'self' data:",
    ["connect-src 'self'", "http://localhost:4000", "https://res.cloudinary.com", apiOrigin].filter(Boolean).join(" "),
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}
