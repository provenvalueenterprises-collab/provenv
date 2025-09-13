import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true'
});

// Plan subscription handler
export async function POST(request: NextRequest) {
  try {
    const { userId, planId, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    switch (action) {
      case 'subscribe':
        return handlePlanSubscription(userId, planId);
      case 'get_dashboard_data':
        return getUserDashboardData(userId);
      case 'create_complaint':
        return createComplaint(userId, await request.json());
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Thrift system error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 1. Plan Subscription with Registration Fee Deduction
async function handlePlanSubscription(userId: string, planId: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get plan details
    const planResult = await client.query(
      'SELECT * FROM contribution_plans WHERE id = $1 AND is_active = true',
      [planId]
    );

    if (planResult.rows.length === 0) {
      throw new Error('Plan not found or inactive');
    }

    const plan = planResult.rows[0];

    // Get user wallet balance
    const userResult = await client.query(
      'SELECT wallet_balance FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User profile not found');
    }

    const currentBalance = parseFloat(userResult.rows[0].wallet_balance || '0');
    const registrationFee = parseFloat(plan.registration_fee);

    if (currentBalance < registrationFee) {
      throw new Error(`Insufficient balance. Registration fee: ₦${registrationFee}, Available: ₦${currentBalance}`);
    }

    // Deduct registration fee
    const newBalance = currentBalance - registrationFee;
    await client.query(
      'UPDATE user_profiles SET wallet_balance = $1, updated_at = NOW() WHERE user_id = $2',
      [newBalance, userId]
    );

    // Log registration fee transaction
    await client.query(`
      INSERT INTO wallet_transactions (
        id, user_id, transaction_type, type, amount, balance_before, balance_after,
        reference, status, description, created_at
      ) VALUES (
        gen_random_uuid(), $1, 'debit', 'plan_registration', $2, $3, $4,
        $5, 'completed', $6, NOW()
      )
    `, [
      userId, registrationFee, currentBalance, newBalance,
      `REG-${Date.now()}`, `Registration fee for ${plan.name}`
    ]);

    // Create thrift account
    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + parseInt(plan.duration_days || '365'));

    const accountResult = await client.query(`
      INSERT INTO thrift_accounts (
        id, user_id, plan_id, account_number, status, start_date, maturity_date,
        current_week, total_weeks, amount_saved, total_defaults, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'active', $4, $5, 0, $6, 0, 0, NOW()
      ) RETURNING *
    `, [
      userId, planId, 
      `TH${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      startDate, maturityDate, Math.ceil(parseInt(plan.duration_days || '365') / 7)
    ]);

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to plan',
      data: {
        thriftAccount: accountResult.rows[0],
        registrationFeeDeducted: registrationFee,
        newWalletBalance: newBalance
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// 2. Complete Dashboard Data (Real-time)
async function getUserDashboardData(userId: string) {
  try {
    // Get user profile with wallet and referral info
    const userProfile = await pool.query(`
      SELECT 
        up.*,
        COALESCE(up.wallet_balance, 0) as wallet_balance,
        COALESCE(up.bonus_wallet, 0) as bonus_wallet,
        COALESCE(up.total_referrals, 0) as total_referrals
      FROM user_profiles up
      WHERE up.user_id = $1
    `, [userId]);

    if (userProfile.rows.length === 0) {
      throw new Error('User profile not found');
    }

    const profile = userProfile.rows[0];

    // Get active thrift accounts with plan details
    const thriftAccounts = await pool.query(`
      SELECT 
        ta.*,
        cp.name as plan_name,
        cp.daily_amount,
        cp.duration_days,
        cp.total_contribution,
        cp.settlement_amount,
        ROUND(
          (EXTRACT(EPOCH FROM (CURRENT_DATE - ta.start_date)) / 86400)::numeric / cp.duration_days * 100, 2
        ) as progress_percentage
      FROM thrift_accounts ta
      JOIN contribution_plans cp ON ta.plan_id = cp.id
      WHERE ta.user_id = $1 AND ta.status = 'active'
      ORDER BY ta.created_at DESC
    `, [userId]);

    // Get contribution history
    const contributionHistory = await pool.query(`
      SELECT 
        dc.*,
        ta.account_number,
        cp.name as plan_name
      FROM daily_contributions dc
      JOIN thrift_accounts ta ON dc.thrift_account_id = ta.id
      JOIN contribution_plans cp ON ta.plan_id = cp.id
      WHERE dc.user_id = $1
      ORDER BY dc.expected_date DESC
      LIMIT 50
    `, [userId]);

    // Get penalty tracking
    const penalties = await pool.query(`
      SELECT 
        pt.*,
        ta.account_number,
        cp.name as plan_name
      FROM penalty_tracking pt
      JOIN thrift_accounts ta ON pt.thrift_account_id = ta.id
      JOIN contribution_plans cp ON ta.plan_id = cp.id
      WHERE pt.user_id = $1
      ORDER BY pt.default_date DESC
    `, [userId]);

    // Get referral bonuses
    const referralBonuses = await pool.query(`
      SELECT 
        rb.*,
        up.phone as referred_phone
      FROM referral_bonuses rb
      LEFT JOIN user_profiles up ON rb.referred_id = up.user_id
      WHERE rb.referrer_id = $1
      ORDER BY rb.created_at DESC
    `, [userId]);

    // Get wallet transactions
    const walletTransactions = await pool.query(`
      SELECT * FROM wallet_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

    // Get complaints
    const complaints = await pool.query(`
      SELECT * FROM complaints
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    // Calculate totals
    const totals = {
      totalContributed: contributionHistory.rows
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + parseFloat(c.actual_amount || '0'), 0),
      totalDefaults: penalties.rows
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + parseFloat(p.total_amount_due || '0'), 0),
      totalReferralEarnings: referralBonuses.rows
        .reduce((sum, r) => sum + parseFloat(r.bonus_amount || '0'), 0),
      pendingComplaints: complaints.rows.filter(c => c.status !== 'resolved').length
    };

    return NextResponse.json({
      success: true,
      data: {
        userProfile: profile,
        thriftAccounts: thriftAccounts.rows,
        contributionHistory: contributionHistory.rows,
        penalties: penalties.rows,
        referralBonuses: referralBonuses.rows,
        walletTransactions: walletTransactions.rows,
        complaints: complaints.rows,
        totals
      }
    });

  } catch (error) {
    throw error;
  }
}

// 3. Complaint Creation
async function createComplaint(userId: string, complaintData: any) {
  try {
    const { category, subject, description, priority = 'medium' } = complaintData;

    if (!category || !subject || !description) {
      throw new Error('Category, subject, and description are required');
    }

    const result = await pool.query(`
      INSERT INTO complaints (
        id, user_id, category, subject, description, message, status, priority, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $4, 'open', $5, NOW()
      ) RETURNING *
    `, [userId, category, subject, description, priority]);

    return NextResponse.json({
      success: true,
      message: 'Complaint submitted successfully',
      data: result.rows[0]
    });

  } catch (error) {
    throw error;
  }
}

// GET endpoint for dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    return getUserDashboardData(userId);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
