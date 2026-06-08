// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Product detail page — fully crawler-safe SSR.
// Every fetch is wrapped in try/catch with timeouts.
// generateMetadata never throws — always returns valid fallback metadata.
// Page component never returns 500 — catches all errors gracefully.
// ─────────────────────────────────────────────────────────────────────────────

import ShopDetails from "./ShopDetails";
import { resolveProductCanonical } from "../../lib/getCanonicalUrl";
import { fetchJson } from "../../lib/fetchWithTimeout";

export const revalidate = 600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";
const SITE = process.env.NEXT_PUBLIC_SITE_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizeSlug(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  try { s = decodeURIComponent(s); } catch { /* ignore */ }
  return s.replace(/^\/+|\/+$/g, "");
}

function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 320);
}

function sanitizeForClient(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(JSON.stringify(raw, (_, v) => {
      if (typeof v === "bigint") return Number(v);
      if (v instanceof Date) return v.toISOString();
      return v;
    }));
  } catch { return null; }
}

function safeParseSchema(raw) {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw)).replace(/</g, "\\u003c");
  } catch { return null; }
}

// ─── Data fetches ─────────────────────────────────────────────────────────────
async function getProductData(slug) {
  const key = slug ? `${slug}/` : "";
  if (!key) return null;

  const { data } = await fetchJson(
    `${API_BASE}/product/s/details`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: key }),
      next: { revalidate: 600 },
    }
  );

  if (!data || data?.status === "error" || !data?.data) return null;
  return data.data;
}

async function getProductReviews(productId) {
  if (!productId) return null;
  const { data } = await fetchJson(
    `${API_BASE}/product_reviews/${productId}/`,
    { next: { revalidate: 60 } }
  );
  return data?.status === "success" ? data : null;
}

// ─── Metadata — never throws ──────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const resolvedSlug = normalizeSlug(slug);
    const data = await getProductData(resolvedSlug);
    const seo = data?.seoMetadata;
    const product = data?.product;

    const title = seo?.meta_title || product?.name || "Product - Disposable Bazaar";
    const description =
      (seo?.meta_description && String(seo.meta_description).trim()) ||
      stripHtml(product?.description) ||
      `Shop ${product?.name || "quality disposable products"} at Disposable Bazaar.`;

    const canonical = resolveProductCanonical(seo?.canonical_url, resolvedSlug);
    const imageUrl = product?.product_image?.[0]?.image
      ? `https://ecommerce-inventory.thegallerygen.com/${String(product.product_image[0].image).replace(/^\/+/, "")}`
      : `${SITE}/og-default.jpg`;

    return {
      title,
      description,
      ...(seo?.focus_keyword ? { keywords: String(seo.focus_keyword).trim() } : {}),
      alternates: canonical ? { canonical } : undefined,
      openGraph: {
        title,
        description,
        images: [imageUrl],
        type: "website",
        siteName: "Disposable Bazaar",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
      },
    };
  } catch (err) {
    console.error("[product/page] generateMetadata error:", err?.message);
    return {
      title: "Product - Disposable Bazaar",
      description: "Shop quality disposable products at Disposable Bazaar.",
      robots: { index: true, follow: true },
    };
  }
}

// ─── Page — never returns 500 ─────────────────────────────────────────────────
export default async function Page({ params }) {
  try {
    const { slug } = await params;
    const resolvedSlug = normalizeSlug(slug);

    // Single API call only — reviews load client-side via ShopDetails
    const data = await getProductData(resolvedSlug);
    const clientData = sanitizeForClient(data);
    const schema = safeParseSchema(data?.seoMetadata?.schema);

    return (
      <>
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: schema }}
          />
        )}
        <ShopDetails initialData={clientData} initialReviews={null} />
      </>
    );
  } catch (err) {
    console.error("[product/page] render error:", err?.message);
    return <ShopDetails initialData={null} initialReviews={null} />;
  }
}
