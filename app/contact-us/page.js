import { buildCanonical, validateCanonical } from "../lib/seo/pageDetail";

export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/9",
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const canonical = validateCanonical(data?.data?.canonical_url) ?? buildCanonical("/contact-us/") ?? undefined;

    return {
      title: data?.data?.meta_title || "Contact Us",
      description: data?.data?.meta_description || "Contact Us page",
      ...(data?.data?.focus_keyword ? { keywords: data.data.focus_keyword } : {}),
      alternates: canonical ? { canonical } : undefined,
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
    console.error("Contact Us metadata fetch failed:", error);
    return {
      title: "Contact Us",
      description: "Contact Us page",
      alternates: { canonical: buildCanonical("/contact-us/") ?? undefined },
      robots: { index: true, follow: true },
    };
  }
}

// 🟩 Load ContactUs Component


import React, { Suspense } from "react";
import ContactUs from "../src/Pages/ContactUs";

export const revalidate = 3600;
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
   <ContactUs />
     </Suspense>
  );
}