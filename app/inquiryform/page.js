
// 🟩 Dynamic Metadata Function for Inquiry Form Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/2",
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      title: data?.data?.meta_title || "Inquiry Form",
      description: data?.data?.meta_description || "Inquiry form page",
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
    console.error("Inquiry Form metadata fetch failed:", error);

    return {
      title: "Inquiry Form",
      description: "Inquiry form page",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

// 🟩 Page Component
import { Suspense } from "react";
import InquiryFormClient from "../src/Pages/InquiryForm";

export const revalidate = 3600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function getProducts() {
  try {
    const res = await fetch(`${API_BASE}/search/product`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const products = await getProducts();
  return (
    <Suspense fallback={<div>Loading Inquiry Form...</div>}>
      <InquiryFormClient initialProducts={products} />
    </Suspense>
  );
}
