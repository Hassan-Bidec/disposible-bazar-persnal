import type { Metadata } from "next";

export const CMS_API_BASE =
  "https://ecommerce-inventory.thegallerygen.com/api";

export type PageDetailData = {
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  focus_keyword?: string;
  robots_index?: string;
  robots_follow?: string;
  schema?: string;
};

type FetchCache =
  | { cache: RequestCache }
  | { next: { revalidate: number } };

export async function fetchPageDetailById(
  id: number,
  cacheOpts: FetchCache = { next: { revalidate: 3600 } }
): Promise<PageDetailData | null> {
  try {
    const res = await fetch(`${CMS_API_BASE}/page/detail/${id}`, cacheOpts);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchPageDetailBySlug(
  slug: string,
  cacheOpts: FetchCache = { next: { revalidate: 3600 } }
): Promise<PageDetailData | null> {
  try {
    const q = slug.replace(/^\//, "").replace(/\/$/, "");
    const res = await fetch(
      `${CMS_API_BASE}/page/detail?slug=${encodeURIComponent(q)}`,
      cacheOpts
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

/**
 * Validate a canonical URL from CMS:
 * - Must be a non-empty string
 * - Must be an absolute HTTPS URL on the same origin as this site
 * - If it points to a different origin (e.g. staging/preview domain), discard it
 * Returns the canonical string if valid, otherwise null.
 */
export function validateCanonical(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  try {
    const url = new URL(t);
    if (!url.pathname) return null;
    // Replace CMS domain with our own SITE_ORIGIN
    if (SITE_ORIGIN) {
      const ownOrigin = new URL(SITE_ORIGIN).origin;
      return `${ownOrigin}${url.pathname}`;
    }
    // No SITE_ORIGIN set — return as-is
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Build a canonical URL from the current page path when CMS doesn't provide one.
 * Pass the pathname like "/product/my-slug/" or "/about-us/".
 * Returns a full https URL using SITE_ORIGIN, or null if origin is unknown.
 */
export function buildCanonical(pathname: string): string | null {
  if (!SITE_ORIGIN) return null;
  try {
    const origin = new URL(SITE_ORIGIN).origin;
    // Ensure pathname starts with / and ends with /
    const clean = "/" + pathname.replace(/^\/+|\/+$/g, "") + "/";
    return `${origin}${clean}`;
  } catch {
    return null;
  }
}

export function metadataFromPageDetail(
  detail: PageDetailData | null,
  fallback: { title: string; description: string; path?: string }
): Metadata {
  if (!detail) {
    const canonical = fallback.path ? buildCanonical(fallback.path) : null;
    return {
      title: fallback.title,
      description: fallback.description,
      alternates: canonical ? { canonical } : undefined,
      robots: { index: true, follow: true },
    };
  }

  // Use CMS canonical if valid, otherwise build from path
  const canonical =
    validateCanonical(detail.canonical_url) ??
    (fallback.path ? buildCanonical(fallback.path) : null);

  const meta: Metadata = {
    title: detail.meta_title || fallback.title,
    description: detail.meta_description || fallback.description,
    alternates: canonical ? { canonical } : undefined,
    ...(detail.focus_keyword ? { keywords: detail.focus_keyword } : {}),
    robots: {
      index: detail.robots_index !== "noindex",
      follow: detail.robots_follow !== "nofollow",
      googleBot: {
        index: detail.robots_index !== "noindex",
        follow: detail.robots_follow !== "nofollow",
      },
    },
  };
  return meta;
}

export function serializeLdJson(schemaRaw?: string): string | null {
  if (!schemaRaw?.trim()) return null;
  try {
    return JSON.stringify(JSON.parse(schemaRaw));
  } catch {
    return null;
  }
}
