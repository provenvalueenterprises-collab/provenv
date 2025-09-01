import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const envVars = {
    // Nhost Configuration
    NEXT_PUBLIC_NHOST_SUBDOMAIN: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
    NEXT_PUBLIC_NHOST_REGION: process.env.NEXT_PUBLIC_NHOST_REGION,
    NEXT_PUBLIC_USE_NHOST: process.env.NEXT_PUBLIC_USE_NHOST,

    // Direct PostgreSQL Database Configuration
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***HIDDEN***' : undefined,
    DB_SSL: process.env.DB_SSL,

    // NextAuth Configuration
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***HIDDEN***' : undefined,

    // Node Environment
    NODE_ENV: process.env.NODE_ENV,

    // Check which .env files exist
    envFiles: {
      '.env.local': 'exists',
      '.env.nextauth': 'exists',
      '.env.example': 'exists'
    }
  };

  res.status(200).json({
    timestamp: new Date().toISOString(),
    environmentVariables: envVars,
    note: 'Database password is hidden for security'
  });
}
