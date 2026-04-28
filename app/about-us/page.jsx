// 🟩 Dynamic Metadata Function for About Us Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/8", // API page ID for About Us
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return {
      title: data?.data?.meta_title || "About Us",
      description: data?.data?.meta_description || "About Us page",

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
    console.error("About Us metadata fetch failed:", error);

    return {
      title: "About Us",
      description: "About Us page",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}


import { Suspense } from "react";
import About from "../src/Pages/AboutUs";

// export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <About />
    </Suspense>
  );
}
