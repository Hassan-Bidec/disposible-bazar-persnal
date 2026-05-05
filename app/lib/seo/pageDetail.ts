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

export function metadataFromPageDetail(
  detail: PageDetailData | null,
  fallback: { title: string; description: string }
): Metadata {
  if (!detail) {
    return {
      title: fallback.title,
      description: fallback.description,
      robots: { index: true, follow: true },
    };
  }
  const meta: Metadata = {
    title: detail.meta_title || fallback.title,
    description: detail.meta_description || fallback.description,
    alternates: detail.canonical_url
      ? { canonical: detail.canonical_url }
      : undefined,
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
