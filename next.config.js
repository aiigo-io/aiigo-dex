/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable webpack cache for Cloudflare Pages deployment
  webpack: (config, { dev, isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Disable webpack cache in production to avoid large cache files
    if (!dev) {
      config.cache = false;
    }
    
    return config;
  },
};

module.exports = nextConfig;
