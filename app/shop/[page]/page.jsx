// ─── SERVER COMPONENT — paginated shop (/shop/2, /shop/3 …) ──────────────────
import { Suspense } from "react";
import CustomHeroSection from "../../src/components/CustomHeroSection";
import ShopClient from "../../src/Pages/ShopClient";

export const revalidate = 300;

// ─── Shared data fetch ────────────────────────────────────────────────────────
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

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { page } = await params;
  const pageData = await getPageData();

  const baseTitle = pageData?.meta_title || "Shop - Disposable Bazar";
  const baseCanonical =
    pageData?.canonical_url || "https://disposablebazaar.com/shop";

  return {
    title: `${baseTitle} - Page ${page}`,
    description:
      pageData?.meta_description ||
      "Browse our full collection of disposable products.",
    ...(pageData?.focus_keyword ? { keywords: pageData.focus_keyword } : {}),
    alternates: { canonical: `${baseCanonical}/${page}` },
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
  const [pageData, products] = await Promise.all([
    getPageData(),
    fetchProducts(),
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
          <ShopClient initialProducts={products} />
        </Suspense>
      </div>
    </>
  );
}
