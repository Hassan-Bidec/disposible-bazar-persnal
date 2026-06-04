// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Bundle detail — crawler-safe SSR. Never throws 500.
// ─────────────────────────────────────────────────────────────────────────────

import BundleDetailClient from "./BundleDetailClient";
import { resolveBundleCanonical } from "../../lib/getCanonicalUrl";
import { fetchJson } from "../../lib/fetchWithTimeout";

export const revalidate = 300;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function getBundleData(slug) {
  try {
    const { data } = await fetchJson(`${API_BASE}/bundles`, {
      next: { revalidate: 300 },
    });
    if (!data?.data) return null;
    const norm = (s) => String(s || "").replace(/\/+$/, "").toLowerCase();
    return data.data.find((b) => norm(b.slug) === norm(slug)) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const bundle = await getBundleData(slug || "");
    const slugClean = String(slug || "").replace(/^\/+|\/+$/g, "");
    const canonical = resolveBundleCanonical(bundle?.canonical_url, slugClean);
    const title = bundle?.meta_title || (bundle?.name ? `${bundle.name} - Disposable Bazaar` : "Bundle - Disposable Bazaar");
    const description = bundle?.description
      ? bundle.description.replace(/<[^>]*>/g, "").slice(0, 160)
      : "Premium bundle deals at Disposable Bazaar.";

    return {
      title,
      description,
      ...(bundle?.focus_keyword ? { keywords: bundle.focus_keyword } : {}),
      alternates: canonical ? { canonical } : undefined,
      openGraph: { title, description, siteName: "Disposable Bazaar" },
      twitter: { card: "summary", title, description },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    };
  } catch (err) {
    console.error("[bundle/page] generateMetadata error:", err?.message);
    return {
      title: "Bundle - Disposable Bazaar",
      description: "Premium bundle deals at Disposable Bazaar.",
      robots: { index: true, follow: true },
    };
  }
}

export default async function Page({ params }) {
  try {
    const { slug } = await params;
    const bundle = await getBundleData(slug || "");

    let schema = null;
    try {
      const raw = bundle?.schema;
      if (raw && raw !== "null") {
        schema = JSON.stringify(JSON.parse(raw)).replace(/</g, "\\u003c");
      }
    } catch { schema = null; }

    return (
      <>
        {schema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
        )}
        <BundleDetailClient initialBundle={bundle} slug={slug} />
      </>
    );
  } catch (err) {
    console.error("[bundle/page] render error:", err?.message);
    return <BundleDetailClient initialBundle={null} slug={slug || ""} />;
  }
}
