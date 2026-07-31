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
};

module.exports = nextConfig;
