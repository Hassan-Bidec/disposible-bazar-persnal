// 🟩 Dynamic Metadata Function for About Us Page
import { buildCanonical } from "../lib/seo/pageDetail";

export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/8",
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const cmsCanonical = data?.data?.canonical_url;
    const canonical =
      (cmsCanonical && cmsCanonical.trim())
        ? cmsCanonical
        : buildCanonical("/about-us/");

    return {
      title: data?.data?.meta_title || "About Us",
      description: data?.data?.meta_description || "About Us page",
      ...(data?.data?.focus_keyword ? { keywords: data.data.focus_keyword } : {}),
      ...(canonical ? { alternates: { canonical } } : {}),
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
      alternates: { canonical: buildCanonical("/about-us/") ?? undefined },
      robots: { index: true, follow: true },
    };
  }
}


import { Suspense } from "react";
import About from "../src/Pages/AboutUs";

export const revalidate = 3600;

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <About />
    </Suspense>
  );
}
