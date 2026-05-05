import CustomizationSlugClient from "./CustomizationSlugClient";
import { serializeLdJson } from "../../lib/seo/pageDetail";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

/** @param {string} slug */
async function fetchCustomizeProduct(slug) {
  const key = slug.replace(/^\/+|\/+$/g, "");
  if (!key) return null;
  try {
    const res = await fetch(`${API_BASE}/product/customize/s/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: key + "/" }),
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

/** @param {{ slug?: string }} p */
function slugFromParams(p) {
  const raw = decodeURIComponent(String(p.slug || ""));
  return raw.replace(/^\/+|\/+$/g, "");
}

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = slugFromParams(params);
  const data = await fetchCustomizeProduct(slug);
  const seo = data?.seoMetadata;
  const product = data?.product;
  const title =
    seo?.meta_title ||
    product?.name ||
    "Customization - Disposable Bazaar";
  const description =
    seo?.meta_description || product?.description || "";
  const firstImg = product?.product_image?.[0]?.image;
  const imageUrl =
    typeof firstImg === "string"
      ? `https://ecommerce-inventory.thegallerygen.com/${firstImg.replace(/^\/+/, "")}`
      : undefined;

  return {
    title,
    description,
    ...(seo?.focus_keyword ? { keywords: seo.focus_keyword } : {}),
    alternates: seo?.canonical_url ? { canonical: seo.canonical_url } : undefined,
    openGraph: {
      title: product?.name || title,
      description: product?.description || description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    robots: {
      index: seo?.robots_index !== "noindex",
      follow: seo?.robots_follow !== "nofollow",
      googleBot: {
        index: seo?.robots_index !== "noindex",
        follow: seo?.robots_follow !== "nofollow",
      },
    },
  };
}

export default async function Page(props) {
  const params = await props.params;
  const slug = slugFromParams(params);
  const initialData = await fetchCustomizeProduct(slug);
  const schemaLd = serializeLdJson(initialData?.seoMetadata?.schema);

  return (
    <>
      {schemaLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaLd }}
        />
      ) : null}
      <CustomizationSlugClient slug={slug} initialData={initialData} />
    </>
  );
}
