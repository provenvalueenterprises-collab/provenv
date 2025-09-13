import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { Client } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authentication required
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

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
    const userQuery = `SELECT id FROM auth.users WHERE email = $1`;
    const userResult = await client.query(userQuery, [session.user.email]);
    
    if (userResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Check pending penalties before funding
    const pendingPenaltiesQuery = `
      SELECT 
        COUNT(*) as pending_count,
        SUM(total_amount_due) as total_penalties_due
      FROM penalty_tracking 
      WHERE user_id = $1 AND status = 'pending'
    `;
    const pendingResult = await client.query(pendingPenaltiesQuery, [userId]);
    const pendingInfo = pendingResult.rows[0];

    // Get current wallet balance
    const balanceQuery = `SELECT wallet_balance FROM users_profiles WHERE user_id = $1`;
    const balanceResult = await client.query(balanceQuery, [userId]);
    const currentBalance = parseFloat(balanceResult.rows[0]?.wallet_balance || 0);

    // Add funds to wallet
    const newBalance = currentBalance + parseFloat(amount);
    await client.query(
      `UPDATE users_profiles SET wallet_balance = $1 WHERE user_id = $2`,
      [newBalance, userId]
    );

    // Record wallet transaction
    await client.query(`
      INSERT INTO wallet_transactions (
        user_id, amount, transaction_type, reference, status,
        balance_before, balance_after, description, created_at
      ) VALUES ($1, $2, 'CREDIT', $3, 'completed', $4, $5, $6, NOW())
    `, [
      userId,
      amount,
      `WALLET_FUNDING_${Date.now()}`,
      currentBalance,
      newBalance,
      'Wallet funding'
    ]);

    // The trigger will automatically attempt to settle penalties
    // Let's check what was settled
    const settledQuery = `
      SELECT 
        COUNT(*) as settled_count,
        SUM(total_amount_due) as total_settled
      FROM penalty_tracking 
      WHERE user_id = $1 AND status = 'settled' 
      AND settled_date = CURRENT_DATE
    `;
    const settledResult = await client.query(settledQuery, [userId]);
    const settledInfo = settledResult.rows[0];

    // Get updated wallet balance and remaining penalties
    const updatedBalanceResult = await client.query(balanceQuery, [userId]);
    const finalBalance = parseFloat(updatedBalanceResult.rows[0]?.wallet_balance || 0);

    const remainingPenaltiesResult = await client.query(pendingPenaltiesQuery, [userId]);
    const remainingInfo = remainingPenaltiesResult.rows[0];

    await client.end();

    return res.status(200).json({
      success: true,
      message: 'Wallet funded successfully',
      funding_details: {
        amount_added: parseFloat(amount),
        previous_balance: currentBalance,
        new_balance: finalBalance,
        amount_deducted_for_penalties: newBalance - finalBalance
      },
      penalty_settlement: {
        penalties_before_funding: {
          count: parseInt(pendingInfo.pending_count),
          total_amount: parseFloat(pendingInfo.total_penalties_due || 0)
        },
        penalties_settled_today: {
          count: parseInt(settledInfo.settled_count || 0),
          total_amount: parseFloat(settledInfo.total_settled || 0)
        },
        remaining_penalties: {
          count: parseInt(remainingInfo.pending_count),
          total_amount: parseFloat(remainingInfo.total_penalties_due || 0)
        }
      },
      auto_settlement_triggered: (settledInfo.settled_count > 0)
    });

  } catch (error) {
    console.error('Wallet funding error:', error);
    return res.status(500).json({ 
      error: 'Wallet funding failed',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}
