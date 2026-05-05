import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,

  // Transpile deps that ship modern JS (optional chaining, etc.) so crawler / older engines
  // don’t parse syntax errors; see https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
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
      }
    ],
    // Reduce image sizes to prevent timeout in SEO crawlers
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Minimize formats for broader compatibility
    formats: ["image/webp"],
  },

  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;