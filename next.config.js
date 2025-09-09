/** @type {import('next').NextConfig} */
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.nextauth
dotenv.config({ path: path.resolve(process.cwd(), '.env.nextauth') });

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.pexels.com'],
  },
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SSL: process.env.DB_SSL,
    CRON_SECRET_TOKEN: process.env.CRON_SECRET_TOKEN,
  },
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig
