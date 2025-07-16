import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for Konva canvas dependency issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Exclude problematic modules from server-side rendering
    config.externals = [...(config.externals || []), 'canvas'];
    
    return config;
  },
  // Transpile specific packages that might have issues
  transpilePackages: ['konva', 'react-konva'],
};

export default nextConfig;
