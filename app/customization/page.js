// 🟩 Dynamic Metadata Function for Customization Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/3",
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();

    return {
      title: data?.data?.meta_title || "Customization - Disposable Bazar",
      description: data?.data?.meta_description || "Customization services for all your disposal needs.",

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
    console.error("Customization metadata fetch failed:", error);
    return {
      title: "Customization - Disposable Bazar",
      description: "Customization Services",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

// 🟩 Load Customization Component


import React, { Suspense } from "react";
import Customization from "../src/Pages/Customization ";

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
      <Customization   />
     </Suspense>
  );
}
