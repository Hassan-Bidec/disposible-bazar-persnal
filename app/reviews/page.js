// 🟩 Dynamic Metadata Function for Reviews Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/4 ", // API page ID for Reviews
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
 
    return {
      title: data?.data?.meta_title || "Reviews",
      description: data?.data?.meta_description || "Reviews page",

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
    console.error("Reviews metadata fetch failed:", error);

    return {
      title: "Reviews",
      description: "Reviews page",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

// 🟩 Load Reviews Component


import React, { Suspense } from "react";
import Reviews from "../src/Pages/Reviews";

export const revalidate = 3600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function getReviewsData() {
  try {
    const res = await fetch(`${API_BASE}/all_reviews`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function Page() {
  const reviewsData = await getReviewsData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Reviews initialReviews={reviewsData} />
    </Suspense>
  );
}