// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Blog listing — blogs fetched server-side, titles visible in initial HTML.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import BlogClient from "../src/Pages/Blog";

export const dynamic = "force-dynamic";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

// ─── Server fetch ─────────────────────────────────────────────────────────────
async function getPageData() {
  try {
    const [metaRes, blogsRes] = await Promise.all([
      fetch(`${API_BASE}/page/detail/10`, { cache: "no-store" }),
      fetch(`${API_BASE}/blogs/index`, { cache: "no-store" }),
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

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata() {
  const { meta } = await getPageData();

  return {
    title: meta?.meta_title || "Blog - Disposable Bazar",
    description: meta?.meta_description || "Read our latest blog posts.",
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
  const { blogs } = await getPageData();
  console.log("getPageData" , getPageData)

  return (
    <>
      {/* ✅ Inject ALL blog schemas safely */}
      {blogs?.map((blog) => {
        let parsedSchema = null;

        try {
          parsedSchema = blog?.blogSeoMetadata?.schema
            ? JSON.stringify(JSON.parse(blog.blogSeoMetadata.schema))
            : null;
        } catch (e) {
          parsedSchema = null;
        }

        return (
          parsedSchema && (
            <script
              key={blog.id}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: parsedSchema }}
            />
          )
        );
      })}

      {/* ✅ SSR fallback for SEO */}
      <noscript>
        <ul>
          {blogs.slice(0, 10).map((b) => (
            <li key={b.id}>
              <a href={`/${b.slug}`}>{b.title}</a>
            </li>
          ))}
        </ul>
      </noscript>

      {/* ✅ Client component */}
      <Suspense fallback={null}>
        <BlogClient />
      </Suspense>
    </>
  );
}