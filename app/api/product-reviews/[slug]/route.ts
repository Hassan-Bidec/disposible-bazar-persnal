import { NextResponse } from "next/server";

const API_BASE = "https://ecommerce-inventory.thegallerygen.com/api";

function normalizeSegment(segment: string) {
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
  const segment = normalizeSegment(rawSlug || "");
  if (!segment) {
    return NextResponse.json({ error: "invalid_product_id" }, { status: 400 });
  }

  // Upstream only accepts numeric product IDs, not URL slugs
  if (!/^\d+$/.test(segment)) {
    return NextResponse.json(
      { status: "error", message: "Product not found", data: [] },
      { status: 404 }
    );
  }

  const pathSlug = `${segment}/`;

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
