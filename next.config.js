/** @type {import('next').NextConfig} */
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.nextauth
dotenv.config({ path: path.resolve(process.cwd(), '.env.nextauth') });

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.pexels.com'], // Add any external image domains you're using
  },
  // Load environment variables from .env.nextauth
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SSL: process.env.DB_SSL,
  },
  // Enable experimental features if needed
  experimental: {
    // Add experimental features here if required
  }
  // Removed cron job initialization from next.config.js as it causes build issues
}

module.exports = nextConfig
