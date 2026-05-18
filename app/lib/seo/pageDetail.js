import {
  getCanonicalUrl,
  buildCanonical,
  validateCanonical,
  resolveCanonical,
} from "../getCanonicalUrl";

export { buildCanonical, validateCanonical, resolveCanonical, getCanonicalUrl };

export const CMS_API_BASE =
  "https://ecommerce-inventory.thegallerygen.com/api";

export async function fetchPageDetailById(
  id,
  cacheOpts = { next: { revalidate: 3600 } }
) {
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
  slug,
  cacheOpts = { next: { revalidate: 3600 } }
) {
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

export function metadataFromPageDetail(detail, fallback) {
  const canonical = resolveCanonical(
    detail?.canonical_url,
    fallback.path
  );

  if (!detail) {
    return {
      title: fallback.title,
      description: fallback.description,
      alternates: canonical ? { canonical } : undefined,
      robots: { index: true, follow: true },
    };
  }

  return {
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
}

export function serializeLdJson(schemaRaw) {
  if (!schemaRaw?.trim()) return null;
  try {
    return JSON.stringify(JSON.parse(schemaRaw));
  } catch {
    return null;
  }
}
