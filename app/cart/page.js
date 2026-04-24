// 🟩 Dynamic Metadata Function for Cart Page
export async function generateMetadata() {
  try {

    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/5",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Fetch failed");

    const json = await res.json();
    const seo = json?.data;

    return {
      title: seo?.meta_title || "Your Cart",
      description:
        seo?.meta_description || "View and manage your cart items",

      alternates: {
        canonical: seo?.canonical_url || "",
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
    console.error("❌ Cart metadata fetch failed:", error);

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






