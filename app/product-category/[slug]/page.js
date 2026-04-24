// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// 1. generateMetadata  → title, description, canonical (server-side)
// 2. <script ld+json>  → schema injected in HTML (Google reads immediately)
// 3. SSR data fetch    → products + category passed to client as initialData
//                        (no loading flash, no "Loading..." in source)
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import CategoryPageClient from "./CategoryPageClient";

export const dynamic = "force-dynamic";

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
async function getPageData(slug) {
  try {
    // Step 1: get category list to find category by slug
    const catRes = await fetch(`${API_BASE}/product/category`, {
      cache: "no-store",
    });
    if (!catRes.ok) return null;
    const catJson = await catRes.json();
    const cat = findCatBySlug(catJson?.data || [], slug);
    if (!cat) return null;

    // Step 2: fetch products for this category
    const prodRes = await fetch(
      `${API_BASE}/search/product?category_id=${cat.id}&sort_by=1`,
      { cache: "no-store" }
    );
    if (!prodRes.ok) return { cat, products: [], category: cat };
    const prodJson = await prodRes.json();

    return {
      cat,                                          // category with seo metadata
      products: prodJson?.data || [],               // product list for SSR
      category: prodJson?.category || cat,          // enriched category from product API
    };
  } catch (e) {
    console.error("CategoryPage SSR fetch failed:", e);
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const slug = params?.slug || "";
  const data = await getPageData(slug);
  const seo = data?.cat?.category_seo_metadata;
   console.log("CategoryPage Metadata Fetched:", data);
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
  const slug = params?.slug || "";
  const data = await getPageData(slug);

  const schema = data?.category?.category_seo_metadata?.schema || null;
  // console.log("CategoryPage SSR Data:", data);

  
  const initialData = data
    ? { products: data.products, category: data.category }
    : null;

  return (
    <>
      {/* JSON-LD schema — in HTML source, Google indexes immediately */}
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
