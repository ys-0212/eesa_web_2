import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // All media is local (public/media); no remote image hosts are needed.
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
