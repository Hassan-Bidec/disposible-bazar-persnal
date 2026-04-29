// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Bundle detail — name, price, items all in initial HTML for Google.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import BundleDetailClient from "./BundleDetailClient";

export const revalidate = 300;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function getBundleData(slug) {
  try {
    // Fetch all bundles and find by slug
    const res = await fetch(`${API_BASE}/bundles`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const bundles = json?.data || [];

    // Match slug with or without trailing slash
    const normalize = (s) => (s || "").replace(/\/+$/, "").toLowerCase();
    const bundle = bundles.find(
      (b) => normalize(b.slug) === normalize(slug)
    );

    return bundle || null;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bundle = await getBundleData(slug || "");
  return {
    title: bundle?.meta_title || (bundle?.name ? `${bundle.name} - Disposable Bazar` : "Bundle - Disposable Bazar"),
    description: bundle?.description
      ? bundle.description.replace(/<[^>]*>/g, "").slice(0, 160)
      : "Premium bundle deals at Disposable Bazar.",
    keywords: bundle?.focus_keyword || "",
    alternates: {
      canonical: bundle?.canonical_url || "",
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const { slug } = await params;
  const bundle = await getBundleData(slug || "");

  // Safe schema parsing
  let schema = null;
  try {
    const raw = bundle?.schema;
    if (raw && raw !== "null") {
      JSON.parse(raw); // validate
      schema = raw;
    }
  } catch {
    schema = null;
  }

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}

      {/* SSR: bundle name + items visible in initial HTML */}
      {bundle && (
        <noscript>
          <h1>{bundle.name}</h1>
          <p>Rs {bundle.payable_amount}</p>
          {bundle.bundle_items?.map((item) => (
            <p key={item.id}>{item.product?.name}</p>
          ))}
        </noscript>
      )}

      <Suspense fallback={null}>
        <BundleDetailClient initialBundle={bundle} slug={slug} />
      </Suspense>
    </>
  );
}
