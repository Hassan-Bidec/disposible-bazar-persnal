// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Sub-category page — crawler-safe SSR. Never throws 500.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import CategoryPageClient from "../CategoryPageClient";
import { resolveCanonical } from "../../../lib/getCanonicalUrl";
import { fetchJson } from "../../../lib/fetchWithTimeout";

export const revalidate = 600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

const normalize = (s) =>
  decodeURIComponent(String(s || "")).toLowerCase().replace(/\/+$/, "");

function findCatBySlug(cats, targetSlug) {
  for (const c of cats) {
    if (normalize(c.slug) === normalize(targetSlug)) return c;
    if (c.subCategories?.length) {
      const found = findCatBySlug(c.subCategories, targetSlug);
      if (found) return found;
    }
  }
  return null;
}

async function getPageData(categorySlug) {
  try {
    const { data: catData } = await fetchJson(`${API_BASE}/product/category`, {
      next: { revalidate: 600 },
    });
    if (!catData?.data) return { cat: null, products: [], category: null, apiDown: true };

    const cat = findCatBySlug(catData.data, categorySlug);
    if (!cat) return { cat: null, products: [], category: null, apiDown: false };

    const { data: prodData } = await fetchJson(
      `${API_BASE}/search/product?category_id=${cat.id}&sort_by=1`,
      { next: { revalidate: 600 } }
    );

    return {
      cat,
      products: prodData?.data || [],
      category: prodData?.category || cat,
      apiDown: false,
    };
  } catch (err) {
    console.error("[sub-category/page] getPageData error:", err?.message);
    return { cat: null, products: [], category: null, apiDown: true };
  }
}

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const parentSlug = String(resolvedParams?.slug || "").replace(/^\/+|\/+$/g, "");
    const categorySlug = String(resolvedParams?.["category-slug"] || "").replace(/^\/+|\/+$/g, "");

    const { cat } = await getPageData(categorySlug);
    const seo = cat?.categorySeoMetadata;
    const fallbackPath = parentSlug && categorySlug
      ? `/product-category/${parentSlug}/${categorySlug}/`
      : categorySlug ? `/product-category/${categorySlug}/` : "/product-category/";
    const canonical = resolveCanonical(seo?.canonical_url, fallbackPath);
    const title = seo?.meta_title || cat?.name || "Product Category - Disposable Bazaar";
    const description = seo?.meta_description || `Browse ${cat?.name || "products"} at Disposable Bazaar.`;

    return {
      title,
      description,
      alternates: canonical ? { canonical } : undefined,
      openGraph: { title, description, siteName: "Disposable Bazaar" },
      twitter: { card: "summary", title, description },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    };
  } catch (err) {
    console.error("[sub-category/page] generateMetadata error:", err?.message);
    return {
      title: "Product Category - Disposable Bazaar",
      description: "Browse our product categories at Disposable Bazaar.",
      robots: { index: true, follow: true },
    };
  }
}

export default async function Page({ params }) {
  try {
    const resolvedParams = await params;
    const categorySlug = String(resolvedParams?.["category-slug"] || "");
    const { cat, products, category } = await getPageData(categorySlug);

    let schema = null;
    try {
      const raw = cat?.categorySeoMetadata?.schema;
      if (raw) { JSON.parse(raw); schema = raw; }
    } catch { schema = null; }

    return (
      <>
        {schema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
        )}
        <Suspense fallback={null}>
          <CategoryPageClient initialData={cat ? { products, category } : null} />
        </Suspense>
      </>
    );
  } catch (err) {
    console.error("[sub-category/page] render error:", err?.message);
    return (
      <Suspense fallback={null}>
        <CategoryPageClient initialData={null} />
      </Suspense>
    );
  }
}
