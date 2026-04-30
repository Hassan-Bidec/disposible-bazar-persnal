// 🟩 Dynamic Metadata Function for Customization Page
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/3",
      { next: { revalidate: 600 } }
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

import { Suspense } from "react";
import Customization from "../src/Pages/Customization ";

export const revalidate = 600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function getPageData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE}/search/Customizeproduct?sort_by=1`, { next: { revalidate: 600 } }),
      fetch(`${API_BASE}/product/category`, { next: { revalidate: 3600 } }),
    ]);
    const products = productsRes.ok ? await productsRes.json() : null;
    const categories = categoriesRes.ok ? await categoriesRes.json() : null;
    return {
      products: products?.data || [],
      categories: categories?.data || [],
    };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function Page() {
  const { products, categories } = await getPageData();
  return (
    <Suspense fallback={null}>
      <Customization initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
