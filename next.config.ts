import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BUSINESS_WHATSAPP: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '9876543210'
  }
};

export default nextConfig;
