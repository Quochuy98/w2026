import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next 16 rejects dev-client chunks with 403 if origin not allowed
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok-free.dev",
    "quiet-lately-quail.ngrok-free.app",
  ],

  images: {
    qualities: [75, 82],
    deviceSizes: [360, 640, 960, 1440],
  },
};

export default nextConfig;
