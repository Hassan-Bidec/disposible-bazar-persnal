import { Suspense } from "react";
import CategoryPageClient from "./CategoryPageClient";

export const dynamic = "force-dynamic";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

// ─── Helpers ───────────────────────────────
const normalize = (s) =>
  decodeURIComponent(s || "")
    .toLowerCase()
    .replace(/\/+$/, "");

// ─── SAME CATEGORY FIND (IMPROVED) ────────
function findCatBySlug(cats, targetSlug, targetId) {
  const normTarget = normalize(targetSlug);
  for (const c of cats) {
    const cSlug = normalize(c.slug);
    const cSlugLastPart = cSlug.split('/').filter(Boolean).pop();

    if (
      cSlug === normTarget ||
      cSlugLastPart === normTarget ||
      (targetId && String(c.id) === String(targetId))
    ) {
      return c;
    }

    if (c.subCategories?.length) {
      const found = findCatBySlug(c.subCategories, targetSlug, targetId);
      if (found) return found;
    }
  }
  return null;
}

// ─── MAIN FETCH (UNCHANGED LOGIC) ──────────
async function getPageData(slug, id) {
  try {
    const catRes = await fetch(`${API_BASE}/product/category`, {
      cache: "no-store",
    });

    if (!catRes.ok) return null;

    const catJson = await catRes.json();
    const cat = findCatBySlug(catJson?.data || [], slug, id);

    if (!cat) return null;

    const prodRes = await fetch(
      `${API_BASE}/search/product?category_id=${cat.id}&sort_by=1`,
      { cache: "no-store" }
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
export async function generateMetadata(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params?.slug || "";
  const id = searchParams?.id || null;

  const data = await getPageData(slug, id);
  const seo = 
    data?.cat?.categorySeoMetadata || 
    data?.cat?.categorySeoDetail ||
    data?.category?.categorySeoMetadata ||
    data?.category?.categorySeoDetail ||
    data?.products?.[0]?.categorySeoDetail;

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
export default async function Page(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params?.slug || "";
  const id = searchParams?.id || null;

  const data = await getPageData(slug, id);

  const seo = 
    data?.cat?.categorySeoMetadata || 
    data?.cat?.categorySeoDetail ||
    data?.category?.categorySeoMetadata ||
    data?.category?.categorySeoDetail ||
    data?.products?.[0]?.categorySeoDetail;

  const schema = seo?.schema || null;

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