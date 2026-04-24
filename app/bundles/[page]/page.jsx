export async function generateMetadata({ params }) {
  const page = params.page;

  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/3",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const json = await res.json();
    const seo = json?.data;

    // 🔍 DEBUG (server terminal me show hoga)
    console.log("FULL API RESPONSE:", json);
    console.log("SEO DATA:", seo);

    const baseTitle = seo?.meta_title || "Bundle Shop - Disposable Bazar";
    const baseDesc =
      seo?.meta_description ||
      "Special bundles and deals on disposable products.";
    const baseCanonical =
      seo?.canonical_url ||
      "https://disposablebazar.com/bundles";

    return {
      title: `${baseTitle} - Page ${page}`,
      description: baseDesc,
      keywords: seo?.focus_keyword || "",

      alternates: {
        canonical: `${baseCanonical}${page ? `/${page}` : ""}`,
      },

      openGraph: {
        title: `${baseTitle} - Page ${page}`,
        description: baseDesc,
        url: `${baseCanonical}/${page}`,
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
  } catch (error) {
    console.error("❌ Metadata fetch failed:", error);

    return {
      title: `Bundle Shop - Page ${page} - Disposable Bazar`,
      description: "Special bundles and deals on disposable products.",
      alternates: {
        canonical: `https://disposablebazar.com/bundles/${page}`,
      },
      robots: { index: true, follow: true },
    };
  }
}

import React, { Suspense } from "react";
import BundleShop from "../../src/Pages/BundleShop";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BundleShop />
    </Suspense>
  );
}
