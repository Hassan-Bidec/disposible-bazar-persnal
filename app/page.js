// 🟩 Dynamic Metadata Function
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/7",
      { next: { revalidate: 300 } }
    );

    const data = await res.json();

    return {
      title: data?.data?.meta_title || "Default Title",
      description: data?.data?.meta_description || "Default Description",
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
    console.error("Metadata fetch failed:", error);
    return {
      title: "Default Title",
      description: "Default Description",
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

// Fetch popular products on the server — SSR
async function getPopularProducts() {
  try {
    const res = await fetch(
      `${API_BASE}/home/popular/product/get`,
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
    getPopularProducts(),
  ]);
  const schemaRaw = pageData?.schema || null;
  let schema = null;
  try {
    schema = schemaRaw ? JSON.stringify(JSON.parse(schemaRaw)) : null;
  } catch {
    schema = null;
  }

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
