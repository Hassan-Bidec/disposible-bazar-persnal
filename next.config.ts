import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecommerce-inventory.thegallerygen.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        pathname: "/**",
      }
    ],
  },
  async headers() {
    return [
      {
        // Next.js compiled static assets — safe to cache forever (content-hashed filenames)
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Next.js optimized images — cache 24h, serve stale for 7 days while revalidating
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // HTML pages, API routes, dynamic routes — NOT touched
      // Vercel/Next.js handles them automatically with correct no-cache behavior
    ];
  },
  compress: true,
};

export default nextConfig;
