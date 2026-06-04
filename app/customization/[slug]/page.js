// ─── SERVER COMPONENT ─────────────────────────────────────────────────────────
// Customization product detail — crawler-safe SSR. Never throws 500.
// ─────────────────────────────────────────────────────────────────────────────

import CustomizationSlugClient from "./CustomizationSlugClient";
import { serializeLdJson } from "../../lib/seo/pageDetail";
import { resolveCanonical } from "../../lib/getCanonicalUrl";
import { fetchJson } from "../../lib/fetchWithTimeout";

export const revalidate = 600;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

function slugFromParams(p) {
  try {
    return decodeURIComponent(String(p?.slug || "")).replace(/^\/+|\/+$/g, "");
  } catch {
    return String(p?.slug || "").replace(/^\/+|\/+$/g, "");
  }
}

async function fetchCustomizeProduct(slug) {
  if (!slug) return null;
  try {
    const { data } = await fetchJson(
      `${API_BASE}/product/customize/s/details`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: `${slug}/` }),
        next: { revalidate: 600 },
      }
    );
    return data?.data ?? null;
  } catch {
    return null;
  }
}

async function getProductReviews(productId) {
  if (!productId) return null;
  try {
    const { data } = await fetchJson(
      `${API_BASE}/product_reviews/${productId}/`,
      { next: { revalidate: 60 } }
    );
    return data?.status === "success" ? data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata(props) {
  try {
    const params = await props.params;
    const slug = slugFromParams(params);
    const data = await fetchCustomizeProduct(slug);
    const seo = data?.seoMetadata;
    const product = data?.product;

    const title = seo?.meta_title || product?.name || "Custom Printing - Disposable Bazaar";
    const description = seo?.meta_description || product?.description?.replace(/<[^>]*>/g, "").slice(0, 160) || "Customize your packaging with Disposable Bazaar.";
    const canonical = resolveCanonical(seo?.canonical_url, `/customization/${slug}/`);
    const imageUrl = product?.product_image?.[0]?.image
      ? `https://ecommerce-inventory.thegallerygen.com/${String(product.product_image[0].image).replace(/^\/+/, "")}`
      : undefined;

    return {
      title,
      description,
      ...(seo?.focus_keyword ? { keywords: seo.focus_keyword } : {}),
      alternates: canonical ? { canonical } : undefined,
      openGraph: {
        title,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
        siteName: "Disposable Bazaar",
      },
      twitter: { card: "summary_large_image", title, description, ...(imageUrl ? { images: [imageUrl] } : {}) },
      robots: {
        index: seo?.robots_index !== "noindex",
        follow: seo?.robots_follow !== "nofollow",
        googleBot: {
          index: seo?.robots_index !== "noindex",
          follow: seo?.robots_follow !== "nofollow",
        },
      },
    };
  } catch (err) {
    console.error("[customization/slug/page] generateMetadata error:", err?.message);
    return {
      title: "Custom Printing - Disposable Bazaar",
      description: "Customize your packaging with Disposable Bazaar.",
      robots: { index: true, follow: true },
    };
  }
}

export default async function Page(props) {
  try {
    const params = await props.params;
    const slug = slugFromParams(params);
    const initialData = await fetchCustomizeProduct(slug);
    const initialReviews = await getProductReviews(initialData?.product?.id);
    const schemaLd = serializeLdJson(initialData?.seoMetadata?.schema);

    return (
      <>
        {schemaLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaLd }} />
        )}
        <CustomizationSlugClient slug={slug} initialData={initialData} initialReviews={initialReviews} />
      </>
    );
  } catch (err) {
    console.error("[customization/slug/page] render error:", err?.message);
    return <CustomizationSlugClient slug="" initialData={null} initialReviews={null} />;
  }
}
