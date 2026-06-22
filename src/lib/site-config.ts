const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  return configured.replace(/\/$/, "");
}
