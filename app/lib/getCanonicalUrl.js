/**
 * Central canonical URL system.
 * Domain source: NEXT_PUBLIC_SITE_URL only.
 * Rule: BASE_URL + path (no query params, normalized slashes).
 */

export function getSiteBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(href).origin;
  } catch {
    return null;
  }
}

/**
 * Strip query/hash, fix duplicate slashes, ensure leading slash.
 * Returns pathname only (e.g. "/shop/", "/").
 */
export function normalizePath(path) {
  if (path == null || path === "") return "/";
  let p = String(path).trim();
  if (!p) return "/";

  p = p.split("?")[0].split("#")[0];

  if (/^https?:\/\//i.test(p)) {
    try {
      const u = new URL(p);
      const origin = getSiteBaseUrl();
      if (origin && u.origin !== origin) return null;
      p = u.pathname;
    } catch {
      return "/";
    }
  }

  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/+/g, "/");
  return p;
}

/**
 * Build absolute canonical URL from a path or slug segment.
 */
export function getCanonicalUrl(path) {
  const origin = getSiteBaseUrl();
  if (!origin) return null;

  const normalized = normalizePath(path);
  if (normalized === null) return null;

  if (normalized === "/") {
    return `${origin}/`;
  }

  const inner = normalized.replace(/^\/+|\/+$/g, "");
  if (!inner) return `${origin}/`;

  return `${origin}/${inner}/`;
}

/** @deprecated Use getCanonicalUrl — kept for existing imports */
export const buildCanonical = getCanonicalUrl;

/**
 * Accept only absolute https URLs on this site's origin (no query/hash).
 */
export function validateCanonical(raw) {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim().split("?")[0].split("#")[0];
  if (!t) return null;
  try {
    const url = new URL(t);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const origin = getSiteBaseUrl();
    if (origin && url.origin !== origin) return null;
    return getCanonicalUrl(url.pathname);
  } catch {
    return null;
  }
}

/**
 * CMS/admin value: slug, relative path, or same-origin full URL.
 * Always falls back to fallbackPath when invalid or cross-origin.
 */
export function resolveCanonical(cmsValue, fallbackPath) {
  if (cmsValue == null || !String(cmsValue).trim()) {
    return fallbackPath ? getCanonicalUrl(fallbackPath) : null;
  }

  const t = String(cmsValue).trim().split("?")[0].split("#")[0];
  if (!t) {
    return fallbackPath ? getCanonicalUrl(fallbackPath) : null;
  }

  if (/^https?:\/\//i.test(t)) {
    return validateCanonical(t) ?? (fallbackPath ? getCanonicalUrl(fallbackPath) : null);
  }

  return getCanonicalUrl(t) ?? (fallbackPath ? getCanonicalUrl(fallbackPath) : null);
}

/**
 * Product pages: CMS may send slug-only, relative, or /product/... paths.
 */
export function resolveProductCanonical(rawCanonical, slugSegment) {
  const slug = String(slugSegment || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  const fallbackPath = slug ? `/product/${slug}/` : "/product/";

  if (rawCanonical == null || !String(rawCanonical).trim()) {
    return getCanonicalUrl(fallbackPath);
  }

  const t = String(rawCanonical).trim().split("?")[0].split("#")[0];
  if (!t) return getCanonicalUrl(fallbackPath);

  if (/^https?:\/\//i.test(t)) {
    return resolveCanonical(t, fallbackPath);
  }

  let path = t.startsWith("/") ? t : `/${t}`;
  if (!path.toLowerCase().includes("/product/")) {
    const inner = path.replace(/^\/+|\/+$/g, "");
    if (inner === slug || inner.startsWith(`${slug}/`)) {
      path = `/product/${slug}/`;
    }
  }

  return getCanonicalUrl(path) ?? getCanonicalUrl(fallbackPath);
}

export function canonicalAlternates(fallbackPath, cmsValue) {
  const canonical = resolveCanonical(cmsValue, fallbackPath);
  return canonical ? { alternates: { canonical } } : {};
}
