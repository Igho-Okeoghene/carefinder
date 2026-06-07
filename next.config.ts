import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for external URLs (Mapbox, etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", // For Supabase storage images
      },
    ],
  },

  // TypeScript type checking during build
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // Optional: Enable React strict mode for development
  reactStrictMode: true,

  // Optional: Environment variables
  env: {
    NEXT_PUBLIC_MAPBOX_STYLE: "mapbox://styles/mapbox/streets-v12",
  },
};

export default nextConfig;
