import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      canvas: false,
      encoding: false,
      'pdfjs-dist/build/pdf.worker.js': false,
    }

    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }

    // Ignore Node.js modules in PDF.js
    config.externals = config.externals || []
    config.externals.push({
      canvas: 'canvas',
      encoding: 'encoding'
    })

    return config
  }
};

export default nextConfig;
