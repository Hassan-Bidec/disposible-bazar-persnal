// 🟩 Dynamic Metadata Function
export async function generateMetadata() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/7",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("API returned error");

    const data = await res.json();

    return {
      title: data?.data?.meta_title || "Default Title",
      description: data?.data?.meta_description || "Default Description",
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

// export const dynamic = "force-dynamic";

// Fetch page data including schema on the server
async function getPageData() {
  try {
    const res = await fetch(
      "https://ecommerce-inventory.thegallerygen.com/api/page/detail/7",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch {
    return null;
  }
}

export default async function Page() {
  const pageData = await getPageData();
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
      <Homes />
    </>
  );
}
