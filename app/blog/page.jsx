export const dynamic = "force-dynamic";


// 🟩 Dynamic Metadata Function for Blog Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/10", // API page ID for Blog
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    console.log("Blog Metadata Fetched:", data);
    return {
      title: data?.data?.meta_title || "Blog",
      description: data?.data?.meta_description || "Blog page",

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
    console.error("Blog metadata fetch failed:", error);

    return {
      title: "Blog",
      description: "Blog page",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}



import { Suspense } from "react";
import Blog from "../../app/src/Pages/Blog";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Blog />
    </Suspense>
  );
}