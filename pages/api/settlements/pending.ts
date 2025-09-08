import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { Client } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`📋 Fetching pending settlements for ${session.user.email}`);

    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    await client.connect();
    console.log('✅ Connected to database for settlements check');

    // Get user
    const userQuery = `SELECT id FROM auth.users WHERE email = $1`;
    const userResult = await client.query(userQuery, [session.user.email]);
    
    if (userResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get pending settlements with account details
    const settlementsQuery = `
      SELECT 
        ps.id,
        ps.contribution_amount,
        ps.penalty_amount,
        ps.total_owed,
        ps.default_date,
        ps.status,
        ps.created_at,
        ta.account_number,
        cp.name as plan_name,
        cp.daily_amount
      FROM pending_settlements ps
      JOIN thrift_accounts ta ON ta.id = ps.thrift_account_id
      JOIN contribution_plans cp ON cp.id = ta.plan_id
      WHERE ps.user_id = $1
      ORDER BY ps.default_date ASC
    `;

    const settlementsResult = await client.query(settlementsQuery, [user.id]);

    // Get current wallet balance
    const balanceQuery = `SELECT wallet_balance FROM users_profiles WHERE user_id = $1`;
    const balanceResult = await client.query(balanceQuery, [user.id]);
    const currentBalance = balanceResult.rows[0]?.wallet_balance || 0;

    // Calculate totals
    const pendingSettlements = settlementsResult.rows.filter(s => s.status === 'pending');
    const completedSettlements = settlementsResult.rows.filter(s => s.status === 'completed');
    
    const totalPendingAmount = pendingSettlements.reduce((sum, s) => sum + parseFloat(s.total_owed), 0);
    const totalContributionsOwed = pendingSettlements.reduce((sum, s) => sum + parseFloat(s.contribution_amount), 0);
    const totalPenaltiesOwed = pendingSettlements.reduce((sum, s) => sum + parseFloat(s.penalty_amount), 0);

    await client.end();

    console.log(`📊 Found ${pendingSettlements.length} pending settlements totaling ₦${totalPendingAmount}`);

    res.status(200).json({
      success: true,
      data: {
        currentWalletBalance: parseFloat(currentBalance),
        summary: {
          totalPendingSettlements: pendingSettlements.length,
          totalPendingAmount,
          totalContributionsOwed,
          totalPenaltiesOwed,
          completedSettlements: completedSettlements.length,
          canSettle: parseFloat(currentBalance) >= totalPendingAmount
        },
        pendingSettlements: pendingSettlements.map(s => ({
          id: s.id,
          planName: s.plan_name,
          accountNumber: s.account_number,
          contributionAmount: parseFloat(s.contribution_amount),
          penaltyAmount: parseFloat(s.penalty_amount),
          totalOwed: parseFloat(s.total_owed),
          defaultDate: s.default_date,
          daysMissed: Math.floor((Date.now() - new Date(s.default_date).getTime()) / (1000 * 60 * 60 * 24))
        })),
        completedSettlements: completedSettlements.map(s => ({
          id: s.id,
          planName: s.plan_name,
          accountNumber: s.account_number,
          contributionAmount: parseFloat(s.contribution_amount),
          penaltyAmount: parseFloat(s.penalty_amount),
          totalOwed: parseFloat(s.total_owed),
          defaultDate: s.default_date,
          settledDate: s.settlement_date
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching pending settlements:', error);
    res.status(500).json({ 
      error: 'Failed to fetch settlements',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
