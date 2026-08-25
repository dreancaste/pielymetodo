import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server serve HMR/static chunks when opened from another
  // device on the LAN (e.g. testing on a phone) instead of only localhost.
  allowedDevOrigins: ["192.168.1.43"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.cosmetologasargentinas.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
