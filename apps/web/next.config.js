const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };

      // Fixes HMR for some development environments.
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 200, // Delay before rebuilding
      };
    }
    return config;
  },
};
module.exports = nextConfig;