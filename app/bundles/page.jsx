// 🟩 Dynamic Metadata Function for BundleShop Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/3", // API page ID for BundleShop
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    console.log("BundleShop Metadata Fetched:", data);

    return {
      title: data?.data?.meta_title || "Bundle Shop - Disposable Bazar",
      description: data?.data?.meta_description || "Special bundles and deals on disposable products.",

      alternates: {
        canonical: data?.data?.canonical_url || "",
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
    console.error("BundleShop metadata fetch failed:", error);
    return {
      title: "Bundle Shop - Disposable Bazar",
      description: "Our special bundles and deals.",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}


import React, { Suspense } from "react";
import BundleShop from "../src/Pages/BundleShop";


export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
     <BundleShop />
    </Suspense>
  );
}
