import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: true,

  experimental: {
    forceSwcTransforms: true,
    // ✅ Sirf woh packages jo aapke package.json mein hain
    optimizePackageImports: [
      "react-icons",
      "framer-motion",
      "swiper",
      "react-toastify",
      "axios",
    ],
  },

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
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/webp"],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },

  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  compress: true,

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  productionBrowserSourceMaps: false,
};

export default nextConfig;