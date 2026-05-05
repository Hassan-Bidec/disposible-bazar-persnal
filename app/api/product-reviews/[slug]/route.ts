import { NextResponse } from "next/server";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

function normalizeReviewsSlug(segment: string) {
  try {
    return decodeURIComponent(segment).replace(/^\/+|\/+$/g, "");
  } catch {
    return segment.replace(/^\/+|\/+$/g, "");
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await context.params;
  const slug = normalizeReviewsSlug(rawSlug || "");
  if (!slug) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  const pathSlug = `${slug}/`;

  try {
    const upstream = await fetch(`${API_BASE}/product_reviews/${pathSlug}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    const text = await upstream.text();
    const contentType =
      upstream.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=0, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "upstream_unavailable" },
      { status: 502 }
    );
  }
}
