// Dynamic route for paginated bundles pages: /bundles/2, /bundles/3, etc.
// Page 1 is served by /bundles/page.jsx (no page number in URL)

export async function generateMetadata({ params }) {
  const page = params.page;
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/3",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const baseTitle = data?.data?.meta_title || "Bundle Shop - Disposable Bazar";
    const baseDesc = data?.data?.meta_description || "Special bundles and deals on disposable products.";
    const baseCanonical = data?.data?.canonical_url || "https://disposablebazar.com/bundles";

    return {
      title: `${baseTitle} - Page ${page}`,
      description: baseDesc,
      alternates: {
        canonical: `${baseCanonical}/${page}`,
      },
      robots: {
        index: data?.data?.robots_index !== "noindex",
        follow: data?.data?.robots_follow !== "nofollow",
        googleBot: {
          index: data?.data?.robots_index !== "noindex",
          follow: data?.data?.robots_follow !== "nofollow",
        },
      },
    };
  } catch (error) {
    console.error("Bundles paginated metadata fetch failed:", error);
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

// export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BundleShop />
    </Suspense>
  );
}
