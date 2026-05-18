// 🟩 Dynamic Metadata Function
import { resolveCanonical, getCanonicalUrl } from "./lib/getCanonicalUrl";

export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/7",
      { next: { revalidate: 300 } }
    );

    const data = await res.json();
    const canonical = resolveCanonical(data?.data?.canonical_url, "/");

    return {
      title: data?.data?.meta_title || "Disposable Bazaar",
      description: data?.data?.meta_description || "Quality disposable products",
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
    console.error("Metadata fetch failed:", error);
    return {
      title: "Disposable Bazaar",
      description: "Quality disposable products",
      alternates: { canonical: getCanonicalUrl("/") ?? undefined },
      robots: { index: true, follow: true },
    };
  }
}

import Homes from "./src/Pages/Homes";

export const revalidate = 300;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

// Fetch page data including schema on the server
async function getPageData() {
  try {
    const res = await fetch(
      `${API_BASE}/page/detail/7`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch {
    return null;
  }
}

// Fetch plastic containers products on the server — SSR
async function getPlasticContainersProducts() {
  try {
    const res = await fetch(
      `${API_BASE}/home/category/28/product`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const [pageData, popularProducts] = await Promise.all([
    getPageData(),
    getPlasticContainersProducts(),
  ]);
  const schema = pageData?.schema || null;

  return (
    <>
      {/* Inject JSON-LD schema into <head> — Google reads this for rich results */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}
      <Homes initialPopularProducts={popularProducts} />
    </>
  );
}
