
// 🟩 Dynamic Metadata Function for Shop Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/1",
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      title: data?.data?.meta_title || "Shop - Disposable Bazar",
      description: data?.data?.meta_description || "Browse our full collection of disposable products.",

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
    console.error("Shop metadata fetch failed:", error);
    
    // Fallback metadata if API is down
    return {
      title: "Shop - Disposable Bazar",
      description: "Browse our wide range of disposable products.",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

// 🟩 Load Shop Component



import React, { Suspense } from "react";
import Shop from "../src/Pages/Shop";

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
      <Shop />
     </Suspense>
  );
}
