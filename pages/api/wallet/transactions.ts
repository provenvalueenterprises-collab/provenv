// pages/api/wallet/transactions.ts
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
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('💳 Fetching wallet transactions for:', session.user.email);

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

    // Get user ID
    const userQuery = `
      SELECT id FROM users WHERE email = $1
    `;
    const userResult = await client.query(userQuery, [session.user.email]);

    if (userResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Get limit from query parameters (default to 50, max 100)
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    // Get transactions
    const transactionsQuery = `
      SELECT 
        id,
        transaction_type,
        type,
        amount,
        balance_before,
        balance_after,
        reference,
        status,
        description,
        payment_method,
        external_reference,
        created_at,
        updated_at
      FROM wallet_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;

    const transactionsResult = await client.query(transactionsQuery, [userId, limit]);

    await client.end();

    console.log(`💳 Found ${transactionsResult.rows.length} transactions for ${session.user.email}`);

    res.status(200).json({
      success: true,
      transactions: transactionsResult.rows,
      count: transactionsResult.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching wallet transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
    });
  }
}
