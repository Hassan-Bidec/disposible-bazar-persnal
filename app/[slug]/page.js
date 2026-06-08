// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Blog detail — crawler-safe SSR. Never throws 500.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import BlogDetailPage from "./BlogDetailPage";
import { resolveCanonical } from "../lib/getCanonicalUrl";
import { fetchJson } from "../lib/fetchWithTimeout";

export const revalidate = 600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";
const SITE = "https://dispasible-bazar-persnal.vercel.app";

async function getBlogData(slug) {
  try {
    const { data } = await fetchJson(
      `${API_BASE}/blogs/s/details`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: `${slug}/` }),
        next: { revalidate: 600 },
      }
    );

    if (!data || data.status !== "success") return null;
    const blogData = data.data || null;

    // Fetch main_image from listing if missing
    if (blogData?.blog && !blogData.blog.main_image) {
      try {
        const { data: listData } = await fetchJson(
          `${API_BASE}/blogs/index`,
          { next: { revalidate: 600 } }
        );
        const match = listData?.data?.find?.(
          (b) => b.slug === `${slug}/` || b.slug === slug
        );
        if (match?.main_image) {
          blogData.blog.main_image = match.main_image.replace(/\/+$/, "");
        }
      } catch { /* ignore */ }
    }

    return blogData;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const data = await getBlogData(slug || "");
    const seo = data?.blog?.blogSeoMetadata;
    const blog = data?.blog;

    const title = seo?.meta_title || blog?.title || "Blog - Disposable Bazaar";
    const description = seo?.meta_description || blog?.excerpt || "Read the latest articles from Disposable Bazaar.";
    const fallbackPath = slug ? `/${String(slug).replace(/^\/+|\/+$/g, "")}/` : "/blog/";
    const canonical = resolveCanonical(seo?.canonical_url, fallbackPath);

    const imageUrl = blog?.main_image
      ? `https://ecommerce-inventory.thegallerygen.com/${String(blog.main_image).replace(/^\/+/, "")}`
      : `${SITE}/og-default.jpg`;

    return {
      title,
      description,
      ...(seo?.focus_keyword ? { keywords: seo.focus_keyword } : {}),
      alternates: canonical ? { canonical } : undefined,
      openGraph: {
        title,
        description,
        images: [imageUrl],
        type: "article",
        siteName: "Disposable Bazaar",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
      },
    };
  } catch (err) {
    console.error("[slug/page] generateMetadata error:", err?.message);
    return {
      title: "Blog - Disposable Bazaar",
      description: "Read the latest articles from Disposable Bazaar.",
      robots: { index: true, follow: true },
    };
  }
}

export default async function Page({ params }) {
  try {
    const { slug } = await params;
    const data = await getBlogData(slug || "");
    const blog = data?.blog || null;
    const recommendedBlogs = data?.recommended_blogs || [];

    let schema = null;
    try {
      const raw = blog?.blogSeoMetadata?.schema;
      if (raw) {
        schema = JSON.stringify(JSON.parse(raw)).replace(/</g, "\\u003c");
      }
    } catch { schema = null; }

    return (
      <>
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: schema }}
          />
        )}
        <Suspense fallback={null}>
          <BlogDetailPage initialBlog={blog} initialRecommended={recommendedBlogs} />
        </Suspense>
      </>
    );
  } catch (err) {
    console.error("[slug/page] render error:", err?.message);
    return (
      <Suspense fallback={null}>
        <BlogDetailPage initialBlog={null} initialRecommended={[]} />
      </Suspense>
    );
  }
}
