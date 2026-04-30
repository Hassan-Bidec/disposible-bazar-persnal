// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
import { Suspense } from "react";
import CustomHeroSection from "../src/components/CustomHeroSection";
import CustomSeo from "../src/components/CustomSeo";
import ShopClient from "../src/Pages/ShopClient";
// import ShopClient from "../src/Pages/ShopClient";

export const revalidate = 300;

// ─── Shared data fetch (metadata + schema + products) ─────────────────────────
async function getPageData() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/1",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

async function fetchProducts() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/search/product?sort_by=1",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.is_customizeable)) return data.is_customizeable;
    return [];
  } catch {
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/product/category",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}
export async function generateMetadata() {
  const pageData = await getPageData();
  return {
    title: pageData?.meta_title || "Shop - Disposable Bazar",
    description:
      pageData?.meta_description ||
      "Browse our full collection of disposable products.",
    alternates: { canonical: pageData?.canonical_url || "" },
    robots: {
      index: pageData?.robots_index !== "noindex",
      follow: pageData?.robots_follow !== "nofollow",
      googleBot: {
        index: pageData?.robots_index !== "noindex",
        follow: pageData?.robots_follow !== "nofollow",
      },
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page() {
  const [pageData, products, categories] = await Promise.all([
    getPageData(),
    fetchProducts(),
    fetchCategories(),
  ]);

  return (
    <>
      {/* JSON-LD Schema — injected into <head>, Google reads for rich results */}
      {pageData?.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: pageData.schema }}
        />
      )}

      <div className="py-15">
        <Suspense fallback={null}>
          <CustomSeo id={1} />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-[#20202c]" />}>
          <CustomHeroSection
            heading="Shop All"
            path="Shop "
            bgImage="CustomHeroAssets/shopbanner.png"
            hideContent={true}
          />
        </Suspense>

        {/* SSR product links — Google indexes these immediately */}
        <noscript>
          <ul className="sr-only">
            {products.slice(0, 12).map((p) => (
              <li key={p.id}>
                <a  
                  href={
                    p.is_customizeable
                      ? `/customization/${p.slug}`
                      : `/product/${p.slug}`
                  }
                >
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </noscript>

        <Suspense fallback={null}>
          <ShopClient initialProducts={products} initialCategories={categories} />
        </Suspense>
      </div>
    </>
  );
}
