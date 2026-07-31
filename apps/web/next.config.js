const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@repo/types': path.resolve(
        __dirname,
        '../../packages/types/src/index.ts'
      ),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') +
          '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
