// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Blog paginated route: /blog/2, /blog/3, etc.
// Reuses the same data fetch and metadata as /blog but with page number.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import { notFound } from "next/navigation";
import BlogClient from "../../src/Pages/Blog";
import { buildCanonical } from "../../lib/seo/pageDetail";

export const revalidate = 300;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

async function getPageData(page = 1) {
  try {
    const [metaRes, blogsRes] = await Promise.all([
      fetch(`${API_BASE}/page/detail/10`, { next: { revalidate: 300 } }),
      fetch(`${API_BASE}/blogs/index?page=${page}`, { next: { revalidate: 300 } }),
    ]);

    const meta = metaRes.ok ? await metaRes.json() : null;
    const blogs = blogsRes.ok ? await blogsRes.json() : null;

    return {
      meta: meta?.data || null,
      blogs: blogs?.data || [],
      totalPages: blogs?.pagination?.last_page || 1,
    };
  } catch {
    return { meta: null, blogs: [], totalPages: 1 };
  }
}

export async function generateMetadata({ params }) {
  const { page } = await params;
  const pageNum = parseInt(page) || 1;

  if (pageNum < 2) notFound();

  const { meta } = await getPageData(pageNum);
  const canonical = buildCanonical(`/blog/${pageNum}/`);

  return {
    title: meta?.meta_title
      ? `${meta.meta_title} - Page ${pageNum}`
      : `Blog - Page ${pageNum} - Disposable Bazar`,
    description: meta?.meta_description || "Read our latest blog posts.",
    ...(meta?.focus_keyword ? { keywords: meta.focus_keyword } : {}),
    alternates: canonical ? { canonical } : undefined,
    // Paginated pages: index only page 2+ if they have content
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function Page({ params }) {
  const { page } = await params;
  const pageNum = parseInt(page) || 1;

  // /blog/1 should redirect to /blog — avoid duplicate content
  if (pageNum < 2) notFound();

  const { blogs, totalPages } = await getPageData(pageNum);

  // Fetch categories for sidebar
  let categories = [];
  try {
    const catRes = await fetch(`${API_BASE}/product/category`, {
      next: { revalidate: 3600 },
    });
    if (catRes.ok) {
      const catJson = await catRes.json();
      categories = catJson?.data || [];
    }
  } catch {
    categories = [];
  }

  return (
    <Suspense fallback={null}>
      <BlogClient
        initialBlogs={blogs}
        initialCategories={categories}
        initialTotalPages={totalPages}
      />
    </Suspense>
  );
}
