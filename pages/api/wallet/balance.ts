// pages/api/wallet/balance.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { Client } from 'pg';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create PostgreSQL client
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    await client.connect();

    // Get user and wallet balance
    const query = `
      SELECT u.id, u.email, up.wallet_balance
      FROM users u 
      LEFT JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `;
    
    const result = await client.query(query, [session.user.email]);
    
    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ error: 'User profile not found' });
    }

    const user = result.rows[0];
    const balance = parseFloat(user.wallet_balance || 0);

    await client.end();

    res.status(200).json({
      success: true,
      balance: balance,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Wallet balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet balance'
    });
  }
}
