// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Customization detail page — full SSR.
// 1. generateMetadata  → title, description, canonical, keywords (server-side)
// 2. <script ld+json>  → schema injected in initial HTML (Google reads immediately)
// 3. SSR data fetch    → product data passed to CustomizationDetails as initialData
//                        (no loading flash, product name/images in initial HTML)
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import CustomizationDetails from "./CustomizationDetails";
import { Loader } from "../../src/components/Loader";

export const dynamic = "force-dynamic";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

// ─── Server-side data fetch ───────────────────────────────────────────────────
async function getProductData(slug) {
  try {
    const res = await fetch(`${API_BASE}/product/customize/s/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const slug = params?.slug || "";
  const data = await getProductData(slug);
  const seo = data?.seoMetadata;
  const product = data?.product;
  console.log("seooo" , seo);

  return {
    title: seo?.meta_title || product?.name || "Customization - Disposable Bazar",
    description: seo?.meta_description || product?.description || "",
    keywords: seo?.focus_keyword || "",
    alternates: {
      canonical: seo?.canonical_url || "",
    },
    openGraph: {
      title: product?.name || "",
      description: product?.description || "",
      images: product?.product_image?.[0]?.image
        ? [`https://ecommerce-inventory.thegallerygen.com/${product.product_image[0].image}`]
        : [],
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
  const data = await getProductData(slug);

  const schema = data?.seoMetadata?.schema || null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
      <Suspense fallback={<Loader />}>
        <CustomizationDetails initialData={data} />
      </Suspense>
    </>
  );
}
