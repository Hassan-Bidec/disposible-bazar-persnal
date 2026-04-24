// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Customization listing page — full SSR.
// 1. generateMetadata  → title, description, canonical (server-side)
// 2. <script ld+json>  → schema injected in initial HTML
// 3. SSR data fetch    → products passed to Customization as initialProducts
//                        (no loading flash, product names visible in initial HTML)
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import Customization from "../src/Pages/Customization ";

export const dynamic = "force-dynamic";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

// ─── Server-side data fetch ───────────────────────────────────────────────────
async function getPageData() {
  try {
    const [metaRes, productsRes] = await Promise.all([
      fetch(`${API_BASE}/page/detail/3`, { cache: "no-store" }),
      fetch(`${API_BASE}/search/Customizeproduct?sort_by=1`, { cache: "no-store" }),
    ]);

    const meta = metaRes.ok ? await metaRes.json() : null;
    const products = productsRes.ok ? await productsRes.json() : null;

    return {
      meta: meta?.data || null,
      products: products?.data || [],
    };
  } catch {
    return { meta: null, products: [] };
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata() {
  const { meta } = await getPageData();

  return {
    title: meta?.meta_title || "Customization - Disposable Bazar",
    description: meta?.meta_description || "Customization services for all your disposal needs.",
    alternates: {
      canonical: meta?.canonical_url || "",
    },
    robots: {
      index: meta?.robots_index !== "noindex",
      follow: meta?.robots_follow !== "nofollow",
      googleBot: {
        index: meta?.robots_index !== "noindex",
        follow: meta?.robots_follow !== "nofollow",
      },
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page() {
  const { meta, products } = await getPageData();

  const schema = meta?.schema || null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}

      {/* SSR: product names visible in initial HTML for Google */}
      <noscript>
        <ul>
          {products.slice(0, 12).map((p) => (
            <li key={p.id}>
              <a href={`/customization/${p.slug}`}>{p.name}</a>
            </li>
          ))}
        </ul>
      </noscript>

      <Suspense fallback={null}>
        <Customization initialProducts={products} />
      </Suspense>
    </>
  );
}
