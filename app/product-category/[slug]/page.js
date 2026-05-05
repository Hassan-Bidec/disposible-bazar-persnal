import { Suspense } from "react";
import CategoryPageClient from "./CategoryPageClient";

export const revalidate = 600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

// ─── Helpers ───────────────────────────────
const normalize = (s) =>
  decodeURIComponent(s || "")
    .toLowerCase()
    .replace(/\/+$/, "");

// ─── SAME CATEGORY FIND (UNCHANGED) ────────
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

// ─── MAIN FETCH (UNCHANGED LOGIC) ──────────
async function getPageData(slug) {
  try {
    const catRes = await fetch(`${API_BASE}/product/category`, {
      next: { revalidate: 600 },
    });

    if (!catRes.ok) return null;

    const catJson = await catRes.json();
    const cat = findCatBySlug(catJson?.data || [], slug);

    if (!cat) return null;

    const prodRes = await fetch(
      `${API_BASE}/search/product?category_id=${cat.id}&sort_by=1`,
      { next: { revalidate: 600 } }
    );

    const prodJson = prodRes.ok ? await prodRes.json() : null;

    return {
      cat,
      products: prodJson?.data || [],
      category: prodJson?.category || cat,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

// ─── 🔥 ONLY SEO IMPROVED (IMPORTANT PART) ───
export async function generateMetadata({ params }) {
  const slug = params?.slug || "";

  const data = await getPageData(slug);
  const seo = data?.cat?.categorySeoMetadata;

  return {
    title:
      seo?.meta_title ||
      data?.cat?.name ||
      "Product Category",

    description: seo?.meta_description || "",

    alternates: {
      canonical: seo?.canonical_url || "",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

// ─── PAGE (UNCHANGED) ───────────────────────
export default async function Page({ params }) {
  const slug = params?.slug || "";
  const data = await getPageData(slug);

  const schema = data?.cat?.categorySeoMetadata?.schema || null;

  const initialData = data
    ? {
      products: data.products,
      category: data.category,
    }
    : null;

  return (
    <>
      {/* JSON-LD (UNCHANGED) */}
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