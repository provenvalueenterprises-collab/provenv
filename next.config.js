/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.pexels.com'], // Add any external image domains you're using
  },
  // Enable experimental features if needed
  experimental: {
    // Add experimental features here if required
  }
  // Removed cron job initialization from next.config.js as it causes build issues
}

module.exports = nextConfig
