// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Blog detail page — full SSR. Blog title, body, schema all in initial HTML.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import BlogDetailClient from "./BlogDetailClient";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

export const dynamic = "force-dynamic";

// ─── Server fetch ─────────────────────────────────────────────────────────────
async function getBlogData(slug) {
  try {
    const res = await fetch(`${API_BASE}/blogs/s/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: `${slug}/` }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== "success") return null;
    return json.data || null;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const slug = params?.slug || "";
  const data = await getBlogData(slug);
  const seo = data?.blog?.blogSeoMetadata;

  return {
    title: seo?.meta_title || data?.blog?.title || "Blog - Disposable Bazar",
    description: seo?.meta_description || "",
    alternates: { canonical: seo?.canonical_url || "" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const slug = params?.slug || "";
  const data = await getBlogData(slug);

  const blog = data?.blog || null;
  const recommendedBlogs = data?.recommended_blogs || [];
  const schema = blog?.blogSeoMetadata?.schema || null;

  return (
    <>
      {/* JSON-LD schema — server-rendered */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      )}

      {/* SSR: blog title + cover visible in initial HTML for Google */}
      {blog && (
        <div className="bg-[#20202C] w-full overflow-x-hidden">
          {/* Hero cover — SSR */}
          <div
            className="flex items-end relative min-h-[550px] text-white w-full"
            style={{
              background: `url('https://ecommerce-inventory.thegallerygen.com/assets/BlogsSection/BlogCover.svg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "25rem",
            }}
          >
            <div className="pl-2 md:pl-32 pb-24">
              <div className="flex gap-2">
                <p>{blog.category} -</p>
                <p>{blog.date}</p>
              </div>
              <h1 className="text-2xl md:text-4xl md:w-2/3">{blog.title}</h1>
            </div>
          </div>

          {/* Interactive parts (sidebar, body, recommended) */}
          <Suspense fallback={null}>
            <BlogDetailClient
              blog={blog}
              recommendedBlogs={recommendedBlogs}
            />
          </Suspense>
        </div>
      )}

      {/* Error state */}
      {!blog && (
        <div className="bg-[#20202C] min-h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
          </div>
        </div>
      )}
    </>
  );
}
