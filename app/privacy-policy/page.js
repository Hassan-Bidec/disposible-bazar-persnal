import { Suspense } from "react";
import PrivacyPolicy from "../src/Pages/PrivacyPolicy";

export const revalidate = 86400;

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://disposablebazaar.com";

async function getPageDetail() {
  try {
    const res = await fetch(`${API_BASE}/page/detail/12`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const detail = await getPageDetail();

  // Use API canonical but replace domain with our SITE_URL
  // API returns: https://ecommerce-inventory.thegallerygen.com/privacy-policy/
  // We want:     https://disposablebazaar.com/privacy-policy/
  let canonical = `${SITE_URL}/privacy-policy/`;
  if (detail?.canonical_url?.trim()) {
    try {
      const apiUrl = new URL(detail.canonical_url.trim());
      canonical = `${SITE_URL}${apiUrl.pathname}`;
    } catch {
      canonical = `${SITE_URL}/privacy-policy/`;
    }
  }

  return {
    title: detail?.meta_title || "Privacy Policy - Disposable Bazaar",
    description: detail?.meta_description || "Privacy policy - Disposable Bazaar",
    ...(detail?.focus_keyword ? { keywords: detail.focus_keyword } : {}),
    alternates: { canonical },
    robots: {
      index: detail?.robots_index !== "noindex",
      follow: detail?.robots_follow !== "nofollow",
      googleBot: {
        index: detail?.robots_index !== "noindex",
        follow: detail?.robots_follow !== "nofollow",
      },
    },
  };
}

export default async function Page() {
  const detail = await getPageDetail();

  // Safe schema injection
  let schemaLd = null;
  try {
    if (detail?.schema?.trim()) {
      JSON.parse(detail.schema); // validate
      schemaLd = detail.schema;
    }
  } catch {
    schemaLd = null;
  }

  return (
    <>
      {schemaLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaLd }}
        />
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <PrivacyPolicy />
      </Suspense>
    </>
  );
}
