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

export async function POST(request: NextRequest) {
  try {
    const { action, userId, referralCode, newUserData } = await request.json();

    switch (action) {
      case 'process_referral_registration':
        return processReferralRegistration(newUserData, referralCode);
      case 'get_referral_info':
        return getReferralInfo(userId);
      case 'generate_referral_link':
        return generateReferralLink(userId);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Referral system error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Process new user registration with referral
async function processReferralRegistration(newUserData: any, referralCode?: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { userId: newUserId, phone, email } = newUserData;

    let referrerId = null;
    const referralBonus = 1000; // ₦1,000 referral bonus

    // Check if referral code exists
    if (referralCode) {
      const referrerResult = await client.query(
        'SELECT user_id FROM user_profiles WHERE referral_code = $1',
        [referralCode]
      );

      if (referrerResult.rows.length > 0) {
        referrerId = referrerResult.rows[0].user_id;
      }
    }

    // Generate unique referral code for new user
    const newReferralCode = await generateUniqueReferralCode(client);

    // Create user profile with referral information
    await client.query(`
      INSERT INTO user_profiles (
        id, user_id, phone, wallet_balance, bonus_wallet, total_referrals,
        referral_code, referred_by, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, 0, 0, 0, $3, $4, NOW()
      ) ON CONFLICT (user_id) DO UPDATE SET
        referral_code = EXCLUDED.referral_code,
        referred_by = EXCLUDED.referred_by
    `, [newUserId, phone, newReferralCode, referrerId]);

    // If referred by someone, process referral bonus
    if (referrerId) {
      // Update referrer's stats and bonus wallet
      await client.query(`
        UPDATE user_profiles 
        SET 
          total_referrals = total_referrals + 1,
          bonus_wallet = bonus_wallet + $1,
          updated_at = NOW()
        WHERE user_id = $2
      `, [referralBonus, referrerId]);

      // Create referral bonus record
      await client.query(`
        INSERT INTO referral_bonuses (
          id, referrer_id, referred_id, bonus_amount, status, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, 'credited', NOW()
        )
      `, [referrerId, newUserId, referralBonus]);

      // Log bonus transaction
      const referrerBalance = await client.query(
        'SELECT bonus_wallet FROM user_profiles WHERE user_id = $1',
        [referrerId]
      );

      const currentBonusBalance = parseFloat(referrerBalance.rows[0].bonus_wallet || '0');

      await client.query(`
        INSERT INTO wallet_transactions (
          id, user_id, transaction_type, type, amount, balance_before, balance_after,
          reference, status, description, created_at
        ) VALUES (
          gen_random_uuid(), $1, 'credit', 'referral_bonus', $2, $3, $4,
          $5, 'completed', $6, NOW()
        )
      `, [
        referrerId, referralBonus, currentBonusBalance - referralBonus, currentBonusBalance,
        `REF-${Date.now()}`, `Referral bonus for ${phone}`
      ]);
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'User registered successfully with referral processing',
      data: {
        newUserReferralCode: newReferralCode,
        referralProcessed: !!referrerId,
        bonusAwarded: referrerId ? referralBonus : 0
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Generate unique referral code
async function generateUniqueReferralCode(client: any): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Generate a 6-character alphanumeric code
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Check if it exists
    const existing = await client.query(
      'SELECT id FROM user_profiles WHERE referral_code = $1',
      [code]
    );

    if (existing.rows.length === 0) {
      return code;
    }

    attempts++;
  }

  // Fallback to timestamp-based code
  return `REF${Date.now().toString().slice(-6)}`;
}

// Get referral information for a user
async function getReferralInfo(userId: string) {
  try {
    // Get user's referral stats
    const userStats = await pool.query(`
      SELECT 
        referral_code,
        total_referrals,
        bonus_wallet,
        referred_by
      FROM user_profiles
      WHERE user_id = $1
    `, [userId]);

    if (userStats.rows.length === 0) {
      throw new Error('User not found');
    }

    const stats = userStats.rows[0];

    // Get referral bonuses earned
    const referralBonuses = await pool.query(`
      SELECT 
        rb.*,
        up.phone as referred_phone,
        up.created_at as referred_date
      FROM referral_bonuses rb
      LEFT JOIN user_profiles up ON rb.referred_id = up.user_id
      WHERE rb.referrer_id = $1
      ORDER BY rb.created_at DESC
    `, [userId]);

    // Get total earnings breakdown
    const earningsBreakdown = await pool.query(`
      SELECT 
        COUNT(*) as total_referrals,
        SUM(bonus_amount) as total_earned,
        SUM(CASE WHEN status = 'credited' THEN bonus_amount ELSE 0 END) as credited,
        SUM(CASE WHEN status = 'pending' THEN bonus_amount ELSE 0 END) as pending
      FROM referral_bonuses
      WHERE referrer_id = $1
    `, [userId]);

    return NextResponse.json({
      success: true,
      data: {
        userStats: stats,
        referralBonuses: referralBonuses.rows,
        earningsBreakdown: earningsBreakdown.rows[0] || {
          total_referrals: 0,
          total_earned: 0,
          credited: 0,
          pending: 0
        }
      }
    });

  } catch (error) {
    throw error;
  }
}

// Generate referral link
async function generateReferralLink(userId: string) {
  try {
    const userResult = await pool.query(
      'SELECT referral_code FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const referralCode = userResult.rows[0].referral_code;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const referralLink = `${baseUrl}/register?ref=${referralCode}`;

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        referralLink,
        socialShareLinks: {
          whatsapp: `https://wa.me/?text=Join ProvenValue and start saving! Use my referral code: ${referralCode}. Register here: ${referralLink}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
          twitter: `https://twitter.com/intent/tweet?text=Join ProvenValue and start saving!&url=${encodeURIComponent(referralLink)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`
        }
      }
    });

  } catch (error) {
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    switch (action) {
      case 'get_referral_info':
        return getReferralInfo(userId);
      case 'generate_referral_link':
        return generateReferralLink(userId);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Referral API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
