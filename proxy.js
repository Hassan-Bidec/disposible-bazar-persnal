import { NextResponse } from "next/server";

const RESERVED = new Set([
  "about-us", "blog", "bundle", "bundles", "cart", "checkout",
  "contact-us", "customdetails", "customization", "customizatiocategory",
  "customseo", "errorpage", "inquiry", "inquiryform", "login",
  "privacy-policy", "product", "product-category", "profile",
  "register", "return-policy", "reviews", "security", "shop",
  "terms-and-conditions", "wishlist", "sitemap.xml", "robots.txt",
]);

const BUNDLE_SLUGS = new Set([
  "picnic-bundle-1",
  "picnic-bundle-2",
]);

function normSlug(s) {
  return String(s || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();
}

export default function proxy(request) {
  try {
    const { pathname } = request.nextUrl;
    const match = pathname.match(/^\/([^/]+)\/?$/);
    if (!match) return NextResponse.next();

    const segment = normSlug(match[1]);
    if (!segment || RESERVED.has(segment)) return NextResponse.next();

    if (BUNDLE_SLUGS.has(segment)) {
      const url = request.nextUrl.clone();
      url.pathname = `/bundle/${segment}/`;
      return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};