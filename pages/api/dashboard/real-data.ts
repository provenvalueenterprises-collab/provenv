import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Real dashboard data API that fetches from your actual database
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('🎯 Real Dashboard API: Starting data fetch...');

  try {
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    console.log('🔌 Real Dashboard API: Database connected');

    // 1. Get total users count
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);
    console.log(`👥 Real Dashboard API: Total users: ${totalUsers}`);

    // 2. Get contribution plans (16 available)
    const plansResult = await pool.query(`
      SELECT id, name, category, daily_amount, settlement_amount, is_active 
      FROM contribution_plans 
      WHERE is_active = true 
      ORDER BY daily_amount ASC
    `);
    console.log(`📋 Real Dashboard API: Found ${plansResult.rows.length} active plans`);

    // 3. Get system settings (25 available)
    const settingsResult = await pool.query(`
      SELECT setting_key, setting_value, description 
      FROM system_settings 
      ORDER BY setting_key
    `);
    console.log(`⚙️ Real Dashboard API: Found ${settingsResult.rows.length} system settings`);

    // 4. Get sample thrift accounts
    const thriftAccountsResult = await pool.query(`
      SELECT COUNT(*) as total FROM thrift_accounts
    `);
    const totalThriftAccounts = parseInt(thriftAccountsResult.rows[0].total);

    // 5. Get wallet transactions count
    const transactionsResult = await pool.query(`
      SELECT COUNT(*) as total FROM wallet_transactions
    `);
    const totalTransactions = parseInt(transactionsResult.rows[0].total);

    // 6. Get user profiles count
    const profilesResult = await pool.query(`
      SELECT COUNT(*) as total FROM user_profiles
    `);
    const totalProfiles = parseInt(profilesResult.rows[0].total);

    // Build dashboard response with real data
    const dashboardData = {
      timestamp: new Date().toISOString(),
      status: 'success',
      database: {
        connected: true,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME
      },
      realStats: {
        totalUsers,
        totalProfiles,
        totalThriftAccounts,
        totalTransactions,
        activePlans: plansResult.rows.length,
        systemSettings: settingsResult.rows.length
      },
      plans: plansResult.rows,
      systemSettings: settingsResult.rows.slice(0, 10), // First 10 settings
      sampleDashboardData: {
        user: {
          name: 'Sample User',
          email: 'user@example.com',
          walletBalance: 25000,
          bonusWallet: 5000
        },
        stats: {
          totalSavings: totalUsers * 10000, // Simulated based on user count
          activeThrifts: Math.max(1, Math.ceil(totalUsers / 5)),
          referrals: Math.floor(totalUsers * 0.3),
          monthlyGrowth: 8.5
        },
        transactions: [
          {
            id: '1',
            type: 'deposit',
            amount: 10000,
            description: 'Wallet funding',
            date: new Date().toISOString().split('T')[0],
            status: 'completed'
          },
          {
            id: '2',
            type: 'contribution',
            amount: 1000,
            description: 'Daily thrift contribution',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            status: 'completed'
          }
        ]
      }
    };

    await pool.end();
    console.log('✅ Real Dashboard API: Data fetch completed successfully');

    res.status(200).json(dashboardData);

  } catch (error: any) {
    console.error('❌ Real Dashboard API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error?.message,
      timestamp: new Date().toISOString()
    });
  }
}
