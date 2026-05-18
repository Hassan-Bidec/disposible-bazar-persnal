// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Blog detail page — full SSR (same pattern as app/page.js)
// 1. generateMetadata  → title, description, canonical (server-side)
// 2. <script ld+json>  → schema injected in initial HTML
// 3. SSR data fetch    → blog passed to BlogDetail as initialBlog
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import BlogDetailPage from "./BlogDetailPage";
import { Loader } from "../src/components/Loader";
import { resolveCanonical } from "../lib/getCanonicalUrl";

export const revalidate = 600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

// ─── Server-side data fetch ───────────────────────────────────────────────────
async function getBlogData(slug) {
  try {
    const res = await fetch(`${API_BASE}/blogs/s/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: `${slug}/` }),
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== "success") return null;

    const data = json.data || null;

    // blogs/s/details doesn't return image — fetch it from listing API
    if (data?.blog && !data.blog.main_image) {
      try {
        const listRes = await fetch(
          `${API_BASE}/blogs/index`,
          { next: { revalidate: 600 } }
        );
        if (listRes.ok) {
          const listJson = await listRes.json();
          const match = listJson?.data?.find?.(
            (b) => b.slug === `${slug}/` || b.slug === slug
          );
          if (match?.main_image) data.blog.main_image = match.main_image.replace(/\/+$/, '');
        }
      } catch { /* ignore */ }
    }

    return data;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogData(slug || "");
  const seo = data?.blog?.blogSeoMetadata;

  const fallbackPath = slug ? `/${slug.replace(/^\/+|\/+$/g, "")}/` : "/";
  const canonical = resolveCanonical(seo?.canonical_url, fallbackPath);

  return {
    title: seo?.meta_title || data?.blog?.title || "Blog - Disposable Bazar",
    description: seo?.meta_description || "",
    keywords: seo?.focus_keyword || "",
    ...(canonical ? { alternates: { canonical } } : {}),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getBlogData(slug || "");

  const blog = data?.blog || null;
  const recommendedBlogs = data?.recommended_blogs || [];

  // Safe schema parsing
  let schema = null;
  try {
    const raw = blog?.blogSeoMetadata?.schema;
    if (raw) {
      JSON.parse(raw); // validate — throws if malformed
      schema = raw;
    }
  } catch {
    schema = null;
  }

  return (
    <>
      {/* Inject JSON-LD schema into <head> — Google reads this immediately */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}

      <Suspense fallback={<Loader />}>
        <BlogDetailPage initialBlog={blog} initialRecommended={recommendedBlogs} />
      </Suspense>
    </>
  );
}
