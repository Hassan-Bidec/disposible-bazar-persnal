


// 🟩 Dynamic Metadata Function for Wishlist Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/11", // API page ID for Wishlist
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      title: data?.data?.meta_title || "Wishlist",
      description: data?.data?.meta_description || "Your Wishlist",
      ...(data?.data?.focus_keyword
        ? { keywords: data.data.focus_keyword }
        : {}),

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
    console.error("Wishlist metadata fetch failed:", error);

    return {
      title: "Wishlist",
      description: "Your Wishlist",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

// 🟩 Load Wishlist Component




import { Suspense } from "react";
import Wishlist from "../src/Pages/Wishlist";

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Wishlist />
    </Suspense>
  );
}

