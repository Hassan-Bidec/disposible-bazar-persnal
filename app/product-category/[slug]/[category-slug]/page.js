// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Sub-category page: /product-category/[slug]/[category-slug]
// Same SSR pattern as the parent [slug]/page.js
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import CategoryPageClient from "../CategoryPageClient";

// export const dynamic = "force-dynamic";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalize = (s) =>
  decodeURIComponent(s || "").toLowerCase().replace(/\/+$/, "");

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

// ─── Server data fetch ────────────────────────────────────────────────────────
async function getPageData(categorySlug) {
  try {
    const catRes = await fetch(`${API_BASE}/product/category`, {
      cache: "no-store",
    });
    if (!catRes.ok) return null;
    const catJson = await catRes.json();
    const cat = findCatBySlug(catJson?.data || [], categorySlug);
    if (!cat) return null;

    const prodRes = await fetch(
      `${API_BASE}/search/product?category_id=${cat.id}&sort_by=1`,
      { cache: "no-store" }
    );
    if (!prodRes.ok) return { cat, products: [], category: cat };
    const prodJson = await prodRes.json();

    return {
      cat,
      products: prodJson?.data || [],
      category: prodJson?.category || cat,
    };
  } catch (e) {
    console.error("SubCategoryPage SSR fetch failed:", e);
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const categorySlug = params?.["category-slug"] || "";
  const data = await getPageData(categorySlug);
  const seo = data?.cat?.category_seo_metadata;

  return {
    title:
      seo?.meta_title ||
      data?.cat?.name ||
      "Product Category - Disposable Bazar",
    description: seo?.meta_description || "",
    alternates: {
      canonical: seo?.canonical_url || "",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const categorySlug = params?.["category-slug"] || "";
  const data = await getPageData(categorySlug);

  const schema = data?.category?.category_seo_metadata?.schema || null;

  const initialData = data
    ? { products: data.products, category: data.category }
    : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
      <Suspense fallback={null}>
        <CategoryPageClient initialData={initialData} />
      </Suspense>
    </>
  );
}
