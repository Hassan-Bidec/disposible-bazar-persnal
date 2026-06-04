import { NextResponse } from "next/server";

/**
 * Crawler-safe middleware.
 * 
 * Problem: Previous version made an async API call to fetch bundle slugs on
 * EVERY request. This meant:
 * - Screaming Frog/Googlebot requests could time out waiting for the API
 * - Cold starts on Vercel would fail if the bundles API was slow
 * - Middleware running on every page request added latency
 * 
 * Fix: Use a hardcoded list of known bundle slugs instead of a live API call.
 * The middleware only redirects /<bundle-slug>/ → /bundle/<bundle-slug>/
 * All other requests pass through immediately with no API calls.
 */

const RESERVED = new Set([
  "about-us", "blog", "bundle", "bundles", "cart", "checkout",
  "contact-us", "customdetails", "customization", "customizatiocategory",
  "customseo", "errorpage", "inquiry", "inquiryform", "login",
  "privacy-policy", "product", "product-category", "profile",
  "register", "return-policy", "reviews", "security", "shop",
  "terms-and-conditions", "wishlist", "sitemap.xml", "robots.txt",
]);

// Known bundle slugs — update this list when new bundles are added in CMS.
// This avoids a live API call on every request which could block crawlers.
const BUNDLE_SLUGS = new Set([
  "picnic-bundle-1",
  "picnic-bundle-2",
]);

function normSlug(s) {
  return String(s || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();
}

export function middleware(request) {
  try {
    const { pathname } = request.nextUrl;
    const match = pathname.match(/^\/([^/]+)\/?$/);
    if (!match) return NextResponse.next();

    const segment = normSlug(match[1]);
    if (!segment || RESERVED.has(segment)) return NextResponse.next();

    // Only redirect if it's a known bundle slug
    if (BUNDLE_SLUGS.has(segment)) {
      const url = request.nextUrl.clone();
      url.pathname = `/bundle/${segment}/`;
      return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
  } catch {
    // Never block a request due to middleware error
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
