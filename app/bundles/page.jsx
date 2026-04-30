// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Bundles listing — bundles fetched server-side, names visible in initial HTML.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import BundleShop from "../src/Pages/BundleShop";

export const revalidate = 300;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function getPageData() {
  try {
    const [metaRes, bundlesRes] = await Promise.all([
      fetch(`${API_BASE}/page/detail/3`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE}/bundles`, { next: { revalidate: 300 } }),
    ]);
    const meta = metaRes.ok ? await metaRes.json() : null;
    const bundles = bundlesRes.ok ? await bundlesRes.json() : null;
    return {
      meta: meta?.data || null,
      bundles: bundles?.data || [],
    };
  } catch {
    return { meta: null, bundles: [] };
  }
}

export async function generateMetadata() {
  const { meta } = await getPageData();
  return {
    title: meta?.meta_title || "Bundle Shop - Disposable Bazar",
    description: meta?.meta_description || "Special bundles and deals on disposable products.",
    alternates: { canonical: meta?.canonical_url || "" },
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

export default async function Page() {
  const { meta, bundles } = await getPageData();
  const schema = meta?.schema || null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}

      {/* SSR: bundle names visible in initial HTML */}
      <noscript>
        <ul>
          {bundles.slice(0, 12).map((b) => (
            <li key={b.id}>
              <a href={`/bundle/${b.slug}`}>{b.name}</a>
            </li>
          ))}
        </ul>
      </noscript>

      <Suspense fallback={null}>
        <BundleShop initialBundles={bundles} />
      </Suspense>
    </>
  );
}
