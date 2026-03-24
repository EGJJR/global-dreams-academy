/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
  },
  /**
   * Avoid webpack filesystem cache "Unable to snapshot resolve dependencies" warnings on some
   * macOS / pnpm / synced-folder setups. Uses in-memory cache (slightly slower rebuilds vs disk).
   */
  webpack: (config) => {
    config.cache = { type: 'memory' }
    return config
  },
}

module.exports = nextConfig

