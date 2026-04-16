// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Bundle detail — name, price, items all in initial HTML for Google.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import BundleDetailClient from "./BundleDetailClient";

export const dynamic = "force-dynamic";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function getBundleData(slug) {
  try {
    const res = await fetch(`${API_BASE}/bundles/getBySlug`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: `${slug}/` }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const slug = params?.slug || "";
  const bundle = await getBundleData(slug);
  return {
    title: bundle?.name ? `${bundle.name} - Disposable Bazar` : "Bundle - Disposable Bazar",
    description: bundle?.description
      ? bundle.description.replace(/<[^>]*>/g, "").slice(0, 160)
      : "Premium bundle deals at Disposable Bazar.",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const slug = params?.slug || "";
  const bundle = await getBundleData(slug);

  return (
    <>
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
