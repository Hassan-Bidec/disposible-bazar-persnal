// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Product detail page — full SSR.
// 1. generateMetadata  → title, description, canonical, keywords (server-side)
// 2. <script ld+json>  → schema injected in initial HTML (Google reads immediately)
// 3. SSR data fetch    → product data passed to ShopDetails as initialData
//                        (no loading flash, product name/images in initial HTML)
// ─────────────────────────────────────────────────────────────────────────────

import ShopDetails from "./ShopDetails";

export const revalidate = 600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

function siteOrigin() {
  const u =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  try {
    return new URL(u).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/**
 * CMS canonical may be slug-only (`my-product/`), relative, or full URL.
 * Invalid values break Next metadata and can 500 the document.
 */
function resolveProductCanonical(rawCanonical, slugSegment) {
  const origin = siteOrigin();
  const slug = String(slugSegment || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  if (!slug) return undefined;

  const defaultProductHref = `${origin}/product/${slug}/`;

  if (rawCanonical == null) return defaultProductHref;
  const t = String(rawCanonical).trim();
  if (!t) return defaultProductHref;

  try {
    if (/^https?:\/\//i.test(t)) {
      return new URL(t).href;
    }
    let path = t.startsWith("/") ? t : `/${t}`;
    if (!path.toLowerCase().includes("/product/")) {
      const inner = path.replace(/^\/+|\/+$/g, "");
      const slugComparable = slug.replace(/\/$/, "");
      if (inner === slugComparable || inner.startsWith(`${slugComparable}/`)) {
        path = `/product/${slugComparable}/`;
      }
    }
    return new URL(path, `${origin}/`).href;
  } catch {
    return defaultProductHref;
  }
}

function escapeJsonForScript(html) {
  return html.replace(/</g, "\\u003c");
}

/**
 * CMS `product/s/details` matches on slug as stored (usually with trailing slash).
 * App route `[slug]` omits the slash; pathname-based client fetches include it.
 */
function normalizeProductSlugForApi(raw) {
  if (raw == null || raw === "") return "";
  let s = String(raw).trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* ignore malformed encoding */
  }
  s = s.replace(/^\/+|\/+$/g, "");
  if (!s) return "";
  return `${s}/`;
}

function stripHtmlToText(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
}

/** JSON-stable payload so RSC can serialize props (no cycles / BigInt / etc.). */
function sanitizeProductForClient(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(
      JSON.stringify(raw, (_, v) => {
        if (typeof v === "bigint") return Number(v);
        if (v instanceof Date) return v.toISOString();
        return v;
      })
    );
  } catch {
    return null;
  }
}

// ─── Server-side data fetch ───────────────────────────────────────────────────
async function getProductData(slug) {
  const key = normalizeProductSlugForApi(slug);
  if (!key) return null;
  try {
    const res = await fetch(`${API_BASE}/product/s/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: key }),
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.status === "error" || !json?.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const resolvedSlug = slug || "";
    const data = await getProductData(resolvedSlug);
    const seo = data?.seoMetadata;
    const product = data?.product;

    const metaDescription =
      (seo?.meta_description && String(seo.meta_description).trim()) ||
      stripHtmlToText(product?.description) ||
      (product?.name ? `Shop ${product.name} at Disposable Bazaar.` : "");

    const canonicalHref = resolveProductCanonical(seo?.canonical_url, resolvedSlug);

    return {
      title: seo?.meta_title || product?.name || "Product - Disposable Bazar",
      description: metaDescription,
      ...(seo?.focus_keyword
        ? { keywords: String(seo.focus_keyword).trim() }
        : {}),
      alternates: canonicalHref ? { canonical: canonicalHref } : undefined,
      openGraph: {
        title: product?.name || seo?.meta_title || "Product - Disposable Bazar",
        description:
          metaDescription ||
          stripHtmlToText(product?.description) ||
          undefined,
        images: product?.product_image?.[0]?.image
          ? [`https://ecommerce-inventory.thegallerygen.com/${product.product_image[0].image.replace(/^\/+/, "")}`]
          : [],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
      },
    };
  } catch {
    return { title: "Product - Disposable Bazar" };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const { slug } = await params;
  const resolvedSlug = slug || "";
  const data = await getProductData(resolvedSlug);
  const clientData = sanitizeProductForClient(data);

  // Inject schema as ld+json in initial HTML if available
  const schemaRaw = data?.seoMetadata?.schema || null;
  let schema = null;
  try {
    schema = schemaRaw ? JSON.stringify(JSON.parse(schemaRaw)) : null;
  } catch {
    schema = null;
  }

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonForScript(schema) }}
        />
      )}
      <ShopDetails initialData={clientData} />
    </>
  );
}
