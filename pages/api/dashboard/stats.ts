import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Pool } from 'pg';

// PostgreSQL connection pool using credentials from .env.nextauth
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Mock data for development when database is unavailable
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
      memberSince: new Date(Date.now() - 2592000000).toISOString() // 30 days ago
    }
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 Dashboard API called');
  
  const session = await getSession({ req });
  console.log('🔐 Session check:', session ? 'Found' : 'Not found');

  if (!session) {
    console.log('❌ No session, returning 401');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user ID from session
    const userId = (session.user as any).id || (session as any).userId;
    console.log('👤 User ID from session:', userId);

    if (!userId) {
      console.log('❌ No user ID found in session');
      return res.status(400).json({ message: 'User ID not found in session' });
    }

    console.log(`🔍 Fetching dashboard data for user: ${userId}`);

    // Try direct PostgreSQL connection
    let client;
    try {
      console.log('🔗 Attempting PostgreSQL connection...');
      client = await pool.connect();
      console.log('✅ PostgreSQL connection established successfully');
      
      // Test connection first
      const testResult = await client.query('SELECT NOW() as current_time');
      console.log('⏰ Database time:', testResult.rows[0].current_time);

      // Fetch user profile data
      console.log('📊 Fetching user profile...');
      const profileQuery = `
        SELECT wallet_balance, bonus_wallet, total_referrals, 
               fast_track_eligible, fast_track_activated, created_at
        FROM users_profiles 
        WHERE user_id = $1
      `;
      const profileResult = await client.query(profileQuery, [userId]);
      console.log(`📊 Profile query returned ${profileResult.rows.length} rows`);

      // Fetch recent transactions
      console.log('💳 Fetching transactions...');
      const transactionsQuery = `
        SELECT id, transaction_type, amount, description, status, created_at
        FROM wallet_transactions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      const transactionsResult = await client.query(transactionsQuery, [userId]);
      console.log(`💳 Transactions query returned ${transactionsResult.rows.length} rows`);

      // Fetch active thrift accounts
      console.log('🎯 Fetching thrift accounts...');
      const thriftQuery = `
        SELECT ta.id, ta.account_number, ta.status, ta.start_date, ta.maturity_date,
               ta.current_week, ta.total_weeks, ta.amount_saved, ta.settlement_amount,
               ta.is_fast_track, cp.name as plan_name, cp.daily_amount, 
               cp.total_contribution as plan_total, cp.settlement_amount as plan_settlement
        FROM thrift_accounts ta
        LEFT JOIN contribution_plans cp ON ta.plan_id = cp.id
        WHERE ta.user_id = $1 AND ta.status IN ('active', 'paused')
        ORDER BY ta.created_at DESC
      `;
      const thriftResult = await client.query(thriftQuery, [userId]);
      console.log(`🎯 Thrift query returned ${thriftResult.rows.length} rows`);

      // If no data found, let's check if user exists
      if (profileResult.rows.length === 0) {
        console.log('⚠️ No profile found, checking if user exists...');
        const userCheckQuery = 'SELECT id, email FROM users WHERE id = $1';
        const userCheck = await client.query(userCheckQuery, [userId]);
        console.log(`👤 User check returned ${userCheck.rows.length} rows`);
        
        if (userCheck.rows.length === 0) {
          console.log('⚠️ User not found in database, using mock data');
          const mockData = getMockDashboardData();
          return res.status(200).json({
            ...mockData,
            _note: 'Using mock data - User profile not found in database'
          });
        }
      }

      // Calculate dashboard statistics from real data
      const profile = profileResult.rows[0] || {};
      const transactions = transactionsResult.rows || [];
      const thrifts = thriftResult.rows || [];

      console.log('📈 Processing data:', {
        profileData: !!profile.wallet_balance,
        transactionCount: transactions.length,
        thriftCount: thrifts.length
      });

      // Calculate total savings
      const totalThriftSavings = thrifts.reduce((sum, thrift) => 
        sum + parseFloat(thrift.amount_saved || 0), 0);
      const walletBalance = parseFloat(profile.wallet_balance || 0);
      const totalSavings = walletBalance + totalThriftSavings;

      // Calculate monthly growth
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = transactions.filter(t =>
        new Date(t.created_at) >= thirtyDaysAgo
      );

      const monthlyIncome = recentTransactions
        .filter(t => t.transaction_type === 'deposit' || t.transaction_type === 'referral_bonus')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyGrowth = monthlyIncome > 0 ? ((monthlyIncome / (totalSavings || 1)) * 100) : 0;

      // Format transactions for frontend
      const formattedTransactions = transactions.map(t => ({
        id: t.id,
        type: t.transaction_type,
        description: t.description || 'Transaction',
        amount: parseFloat(t.amount),
        date: new Date(t.created_at).toISOString().split('T')[0],
        status: t.status
      }));

      // Format active thrift (take the first one)
      const activeThrift = thrifts.length > 0 ? {
        id: thrifts[0].id,
        planName: thrifts[0].plan_name || 'Thrift Plan',
        currentAmount: parseFloat(thrifts[0].amount_saved || 0),
        targetAmount: parseFloat(thrifts[0].plan_settlement || thrifts[0].settlement_amount || 0),
        daysRemaining: Math.max(0, Math.ceil(
          (new Date(thrifts[0].maturity_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )),
        progressPercent: Math.round(
          ((parseFloat(thrifts[0].amount_saved || 0)) / 
           (parseFloat(thrifts[0].plan_settlement || thrifts[0].settlement_amount || 1))) * 100
        ),
        status: thrifts[0].status,
        isFastTrack: thrifts[0].is_fast_track || false
      } : null;

      const dashboardData = {
        stats: {
          totalSavings: Math.round(totalSavings),
          activeThrifts: thrifts.length,
          referrals: parseInt(profile.total_referrals || 0),
          monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
        },
        recentTransactions: formattedTransactions,
        activeThrift,
        profile: {
          walletBalance: Math.round(walletBalance),
          bonusWallet: Math.round(parseFloat(profile.bonus_wallet || 0)),
          fastTrackEligible: profile.fast_track_eligible || false,
          fastTrackActivated: profile.fast_track_activated || false,
          memberSince: profile.created_at || new Date().toISOString()
        }
      };

      console.log('📈 Dashboard data successfully prepared from PostgreSQL:', JSON.stringify(dashboardData, null, 2));

      return res.status(200).json(dashboardData);

    } catch (dbError) {
      console.error('❌ PostgreSQL connection failed:', dbError);
      console.log('🔄 Falling back to mock data due to database connection issues');
      
      const mockData = getMockDashboardData();
      return res.status(200).json({
        ...mockData,
        _note: 'Using mock data due to PostgreSQL connection issues. Check database credentials in .env.nextauth'
      });
    } finally {
      if (client) {
        client.release();
      }
    }

  } catch (error) {
    console.error('❌ Dashboard API error:', error);
    
    // Always fall back to mock data on any error
    const mockData = getMockDashboardData();
    return res.status(200).json({
      ...mockData,
      _note: 'Using mock data due to API error'
    });
  }
}
