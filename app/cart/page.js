// 🟩 Dynamic Metadata Function for Cart Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/5", // API page ID for Cart
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();

    return {
      title: data?.data?.meta_title || "Your Cart",
      description: data?.data?.meta_description || "View and manage your cart items",
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
    console.error("Cart metadata fetch failed:", error);
    return {
      title: "Your Cart | Shop",
      description: "View and manage your cart items",
    };
  }
}



import React, { Suspense } from "react";
import Cart from "../src/components/cart/Cart";

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
 <Cart />
     </Suspense>
  );
}






