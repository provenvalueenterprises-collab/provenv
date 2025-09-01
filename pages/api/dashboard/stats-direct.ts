import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Pool } from 'pg';

// Direct PostgreSQL connection using credentials from .env.nextauth
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
  idleTimeoutMillis: 60000,
  max: 5
});

// Mock data for fallback
const getMockDashboardData = () => {
  const mockTransactions = [
    {
      id: 'mock-1',
      type: 'deposit',
      description: 'Wallet Deposit',
      amount: 50000,
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    },
    {
      id: 'mock-2',
      type: 'contribution',
      description: 'Thrift Contribution',
      amount: 25000,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      status: 'completed'
    },
    {
      id: 'mock-3',
      type: 'referral_bonus',
      description: 'Referral Bonus',
      amount: 5000,
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      status: 'completed'
    }
  ];

  return {
    stats: {
      totalSavings: 125000,
      activeThrifts: 2,
      referrals: 3,
      monthlyGrowth: 8.5
    },
    recentTransactions: mockTransactions,
    activeThrift: {
      id: 'mock-thrift-1',
      planName: 'Premium Thrift Plan',
      currentAmount: 75000,
      targetAmount: 200000,
      daysRemaining: 45,
      progressPercent: 38,
      status: 'active',
      isFastTrack: false
    },
    profile: {
      walletBalance: 50000,
      bonusWallet: 2500,
      fastTrackEligible: true,
      fastTrackActivated: false,
      memberSince: new Date(Date.now() - 2592000000).toISOString()
    }
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Get user ID from session
    const userId = (session.user as any).id || (session as any).userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in session' });
    }

    console.log('🔍 Fetching dashboard data for user:', userId);

    // Try direct PostgreSQL connection first
    try {
      const client = await pool.connect();
      console.log('✅ Direct PostgreSQL connection successful');

      // Fetch user profile data
      const profileQuery = `
        SELECT 
          wallet_balance,
          bonus_wallet,
          total_referrals,
          fast_track_eligible,
          fast_track_activated,
          created_at
        FROM public.users_profiles 
        WHERE user_id = $1
      `;
      
      const profileResult = await client.query(profileQuery, [userId]);
      const profile = profileResult.rows[0] || {};

      // Fetch recent transactions
      const transactionsQuery = `
        SELECT 
          id,
          transaction_type,
          amount,
          description,
          status,
          created_at
        FROM public.wallet_transactions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      
      const transactionsResult = await client.query(transactionsQuery, [userId]);
      const transactions = transactionsResult.rows;

      // Fetch active thrift accounts
      const thriftQuery = `
        SELECT 
          ta.id,
          ta.account_number,
          ta.status,
          ta.start_date,
          ta.maturity_date,
          ta.amount_saved,
          ta.settlement_amount,
          ta.is_fast_track,
          cp.name as plan_name,
          cp.total_contribution,
          cp.daily_amount
        FROM public.thrift_accounts ta
        LEFT JOIN public.contribution_plans cp ON ta.plan_id = cp.id
        WHERE ta.user_id = $1 
        AND ta.status IN ('active', 'paused')
        ORDER BY ta.created_at DESC
      `;
      
      const thriftResult = await client.query(thriftQuery, [userId]);
      const thrifts = thriftResult.rows;

      client.release();

      // Calculate dashboard statistics
      const totalThriftSavings = thrifts.reduce((sum: number, thrift: any) => 
        sum + parseFloat(thrift.amount_saved || 0), 0);
      const walletBalance = parseFloat(profile.wallet_balance || 0);
      const totalSavings = walletBalance + totalThriftSavings;

      // Calculate monthly growth
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = transactions.filter((t: any) =>
        new Date(t.created_at) >= thirtyDaysAgo
      );

      const monthlyIncome = recentTransactions
        .filter((t: any) => t.transaction_type === 'deposit' || t.transaction_type === 'referral_bonus')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const monthlyExpenses = recentTransactions
        .filter((t: any) => t.transaction_type === 'withdrawal' || t.transaction_type === 'contribution')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const monthlyGrowth = monthlyIncome - monthlyExpenses;
      const monthlyGrowthPercent = totalSavings > 0 ? (monthlyGrowth / totalSavings) * 100 : 0;

      // Format transactions
      const formattedTransactions = transactions.map((t: any) => ({
        id: t.id,
        type: t.transaction_type,
        description: t.description || getTransactionDescription(t.transaction_type),
        amount: parseFloat(t.amount),
        date: new Date(t.created_at).toISOString().split('T')[0],
        status: t.status
      }));

      // Format active thrift
      const activeThrift = thrifts.length > 0 ? thrifts[0] : null;
      let formattedActiveThrift = null;

      if (activeThrift) {
        const startDate = new Date(activeThrift.start_date);
        const maturityDate = new Date(activeThrift.maturity_date);
        const today = new Date();
        const totalDays = Math.ceil((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, totalDays - daysPassed);
        const progressPercent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

        formattedActiveThrift = {
          id: activeThrift.id,
          planName: activeThrift.plan_name || 'Thrift Plan',
          currentAmount: parseFloat(activeThrift.amount_saved || 0),
          targetAmount: parseFloat(activeThrift.total_contribution || activeThrift.settlement_amount || 0),
          daysRemaining,
          progressPercent: Math.round(progressPercent),
          status: activeThrift.status,
          isFastTrack: activeThrift.is_fast_track
        };
      }

      const dashboardData = {
        stats: {
          totalSavings,
          activeThrifts: thrifts.length,
          referrals: profile.total_referrals || 0,
          monthlyGrowth: monthlyGrowthPercent
        },
        recentTransactions: formattedTransactions,
        activeThrift: formattedActiveThrift,
        profile: {
          walletBalance,
          bonusWallet: parseFloat(profile.bonus_wallet || 0),
          fastTrackEligible: profile.fast_track_eligible || false,
          fastTrackActivated: profile.fast_track_activated || false,
          memberSince: profile.created_at
        }
      };

      console.log('✅ Direct PostgreSQL data fetch successful');
      return res.status(200).json(dashboardData);

    } catch (dbError) {
      console.warn('⚠️ Direct PostgreSQL connection failed, using mock data:', dbError);

      // Return mock data for development
      const mockData = getMockDashboardData();
      return res.status(200).json({
        ...mockData,
        _note: 'Using mock data due to PostgreSQL connection issues. Check database credentials and connectivity.'
      });
    }

  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getTransactionDescription(type: string): string {
  const descriptions = {
    deposit: 'Wallet Deposit',
    withdrawal: 'Wallet Withdrawal',
    contribution: 'Thrift Contribution',
    fine: 'Late Payment Fine',
    referral_bonus: 'Referral Bonus',
    settlement: 'Thrift Settlement'
  };
  return descriptions[type as keyof typeof descriptions] || 'Transaction';
}
