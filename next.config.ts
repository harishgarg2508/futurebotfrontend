import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Only use static export for mobile builds (Capacitor)
  // For Vercel/Web, we use default output to support API routes and Image Optimization
  output: process.env.IS_MOBILE_BUILD === 'true' ? 'export' : undefined,
  
  // Turbopack configuration
  turbopack: {},
  
  // Skip trailing slash for export to avoid _not-found issues
  trailingSlash: true,
  
  // Optimize for static export
  ...(process.env.IS_MOBILE_BUILD === 'true' && {
    images: {
      unoptimized: true,
    },
  }),

};

export default withPWA(nextConfig);
