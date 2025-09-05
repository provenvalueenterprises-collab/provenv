import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// API endpoint to fetch and display real dashboard data
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('🔧 Dashboard Data API: Starting real data fetch...');

  try {
    // Database connection
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    console.log('🔌 Dashboard Data API: Connecting to database...');

    // Test database connection first
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Dashboard Data API: Database connected at', connectionTest.rows[0].current_time);

    // 1. Get all users data
    console.log('📊 Dashboard Data API: Fetching users...');
    const usersResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
    console.log(`👥 Dashboard Data API: Found ${usersResult.rows.length} users`);

    // 2. Get count statistics
    const userCountResult = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const totalUsers = parseInt(userCountResult.rows[0].total_users);
    console.log(`📈 Dashboard Data API: Total registered users: ${totalUsers}`);

    // 3. Get recent registrations (last 7 days)
    const recentUsersResult = await pool.query(`
      SELECT COUNT(*) as recent_users 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const recentUsers = parseInt(recentUsersResult.rows[0].recent_users);
    console.log(`🆕 Dashboard Data API: New users (last 7 days): ${recentUsers}`);

    // 4. Get user distribution by status (if we have such a field)
    let usersByStatus = null;
    try {
      const statusResult = await pool.query(`
        SELECT 
          CASE 
            WHEN phone IS NOT NULL AND email IS NOT NULL THEN 'complete'
            WHEN phone IS NULL OR email IS NULL THEN 'incomplete'
            ELSE 'unknown'
          END as status,
          COUNT(*) as count
        FROM users 
        GROUP BY status
      `);
      usersByStatus = statusResult.rows;
      console.log('📊 Dashboard Data API: User status distribution:', usersByStatus);
    } catch (err) {
      console.log('ℹ️ Dashboard Data API: Status analysis skipped:', err instanceof Error ? err.message : String(err));
    }

    // 5. Build dashboard response
    const dashboardData = {
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        connectionTime: connectionTest.rows[0].current_time,
        host: process.env.DB_HOST
      },
      statistics: {
        totalUsers,
        recentUsers,
        usersByStatus
      },
      users: usersResult.rows.map(user => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        // Hide sensitive data in logs
        hasPassword: !!user.password_hash
      })),
      sampleData: {
        stats: {
          totalSavings: 150000 + (totalUsers * 1000), // Simulate based on user count
          activeThrifts: Math.ceil(totalUsers / 3),
          referrals: Math.floor(totalUsers * 0.8),
          monthlyGrowth: 5.2,
          walletBalance: 25000 + (recentUsers * 500)
        }
      }
    };

    console.log('✅ Dashboard Data API: Successfully fetched all data');
    console.log(`📊 Dashboard Data API: Returning data for ${totalUsers} users`);

    // Close database connection
    await pool.end();

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('❌ Dashboard Data API Error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}
