import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      // Get user profile
      const userQuery = `
        SELECT 
          u.id,
          u.display_name,
          u.email,
          u.phone_number,
          u.email_verified,
          u.created_at,
          up.phone,
          up.wallet_balance,
          up.bonus_wallet,
          up.total_referrals,
          up.referral_code,
          up.fast_track_eligible,
          up.fast_track_activated,
          up.virtual_account_number,
          up.virtual_account_bank,
          up.updated_at as profile_updated_at
        FROM auth.users u
        LEFT JOIN public.users_profiles up ON u.id = up.user_id
        WHERE u.email = $1
      `;

      const result = await pool.query(userQuery, [session.user.email]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      return res.status(200).json({
        success: true,
        profile: {
          id: user.id,
          displayName: user.display_name,
          email: user.email,
          phoneNumber: user.phone_number || user.phone,
          emailVerified: user.email_verified,
          memberSince: user.created_at,
          walletBalance: user.wallet_balance || 0,
          bonusWallet: user.bonus_wallet || 0,
          totalReferrals: user.total_referrals || 0,
          referralCode: user.referral_code,
          fastTrackEligible: user.fast_track_eligible || false,
          fastTrackActivated: user.fast_track_activated || false,
          virtualAccountNumber: user.virtual_account_number,
          virtualAccountBank: user.virtual_account_bank,
          lastUpdated: user.profile_updated_at
        }
      });

    } else if (req.method === 'PUT') {
      // Update user profile
      const { displayName, phoneNumber } = req.body;

      if (!displayName || !phoneNumber) {
        return res.status(400).json({ error: 'Display name and phone number are required' });
      }

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Update auth.users table
        await client.query(
          'UPDATE auth.users SET display_name = $1, phone_number = $2, updated_at = NOW() WHERE email = $3',
          [displayName, phoneNumber, session.user.email]
        );

        // Update users_profiles table
        await client.query(
          `UPDATE public.users_profiles 
           SET phone = $1, updated_at = NOW() 
           WHERE user_id = (SELECT id FROM auth.users WHERE email = $2)`,
          [phoneNumber, session.user.email]
        );

        await client.query('COMMIT');

        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully'
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('❌ Profile API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
