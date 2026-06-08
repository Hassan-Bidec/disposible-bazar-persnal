import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,

  transpilePackages: [
    "@react-google-maps/api",
    "@react-oauth/google",
    "aos",
    "axios",
    "dompurify",
    "framer-motion",
    "html-react-parser",
    "html2canvas",
    "isomorphic-dompurify",
    "js-confetti",
    "leaflet",
    "react-icons",
    "react-leaflet",
    "react-toastify",
    "swiper",
    "uuid",
    "lucide-react",
  ],

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
    // Longer timeout for external CMS images
    minimumCacheTTL: 3600,
  },

  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        // Allow all bots — no bot blocking headers
        source: "/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "all" },
        ],
      },
    ];
  },

  compress: true,

  // Only remove console in production to keep error logs visible on Vercel
  compiler: {
    removeConsole: false,
  },

  // Prevent page-level errors from crashing the entire build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
