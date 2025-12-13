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
  
  // Exclude API routes from static export (they don't work in mobile anyway)
  ...(process.env.IS_MOBILE_BUILD === 'true' && {
    // This will be handled by the build script cleaning up the routes
  }),

};

export default withPWA(nextConfig);
