function encodePathSegment(segment) {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

/**
 * Build a full asset URL with each path segment encoded (spaces, parentheses, etc.).
 * Required for next/image when CMS filenames are not URL-safe.
 */
export function buildAssetUrl(baseUrl, relativePath) {
  if (relativePath == null || relativePath === "") return "";

  const raw = String(relativePath).trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      const pathname = u.pathname
        .split("/")
        .map(encodePathSegment)
        .join("/");
      return `${u.origin}${pathname}${u.search}${u.hash}`;
    } catch {
      return raw;
    }
  }

  if (!baseUrl) return raw;

  const base = String(baseUrl).replace(/\/+$/, "");
  const path = raw.replace(/^\/+/, "");
  const encodedPath = path.split("/").map(encodePathSegment).join("/");
  return `${base}/${encodedPath}`;
}
