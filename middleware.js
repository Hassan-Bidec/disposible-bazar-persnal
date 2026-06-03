import { NextResponse } from "next/server";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

const RESERVED = new Set([
  "about-us",
  "blog",
  "bundle",
  "bundles",
  "cart",
  "checkout",
  "contact-us",
  "customdetails",
  "customization",
  "customizatiocategory",
  "customseo",
  "errorpage",
  "inquiry",
  "inquiryform",
  "login",
  "privacy-policy",
  "product",
  "product-category",
  "profile",
  "register",
  "return-policy",
  "reviews",
  "security",
  "shop",
  "terms-and-conditions",
  "wishlist",
]);

let bundleSlugsCache = null;
let cacheAt = 0;
const CACHE_MS = 5 * 60 * 1000;

function normSlug(s) {
  return String(s || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

async function getBundleSlugs() {
  const now = Date.now();
  if (bundleSlugsCache && now - cacheAt < CACHE_MS) return bundleSlugsCache;

  try {
    const res = await fetch(`${API_BASE}/bundles`, { next: { revalidate: 300 } });
    if (!res.ok) return bundleSlugsCache || new Set();
    const json = await res.json();
    const slugs = new Set(
      (Array.isArray(json?.data) ? json.data : [])
        .map((b) => normSlug(b.slug))
        .filter(Boolean)
    );
    bundleSlugsCache = slugs;
    cacheAt = now;
    return slugs;
  } catch {
    return bundleSlugsCache || new Set();
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/([^/]+)\/?$/);
  if (!match) return NextResponse.next();

  const segment = normSlug(match[1]);
  if (!segment || RESERVED.has(segment)) return NextResponse.next();

  const bundleSlugs = await getBundleSlugs();
  if (!bundleSlugs.has(segment)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/bundle/${segment}/`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
