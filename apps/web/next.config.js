const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui"],
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = { fs: false, ...config.resolve.fallback };
    }
    config.resolve.alias["react"] = path.resolve("../../node_modules/react");
    return config;
  },
};
module.exports = nextConfig;