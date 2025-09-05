// Direct PostgreSQL database connection for authentication
// This bypasses Nhost GraphQL and connects directly to the database

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  display_name: string;
  email: string;
  phone_number?: string;
  password_hash: string;
  email_verified: boolean;
  created_at: Date;
  // Profile data from users_profiles table
  phone?: string;
  wallet_balance?: number;
  bonus_wallet?: number;
  total_referrals?: number;
  referral_code?: string;
  fast_track_eligible?: boolean;
  fast_track_activated?: boolean;
}

class DirectDatabaseConnection {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true',
      max: 10, // Reduced from 20
      min: 2, // Minimum connections
      idleTimeoutMillis: 60000, // Increased from 30000
      connectionTimeoutMillis: 10000, // Increased from 2000
      query_timeout: 30000, // Timeout for queries
      allowExitOnIdle: true
    });

    // Test connection on initialization
    this.testConnection();
  }

  private async testConnection() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Direct PostgreSQL connection established');
      client.release();
    } catch (error) {
      console.error('❌ Direct PostgreSQL connection failed:', error);
    }
  }

  // Find user by email with profile data
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT
          u.id,
          u.display_name,
          u.email,
          u.phone_number,
          u.password_hash,
          u.email_verified,
          u.created_at,
          up.phone,
          up.wallet_balance,
          up.bonus_wallet,
          up.total_referrals,
          up.referral_code,
          up.fast_track_eligible,
          up.fast_track_activated
        FROM auth.users u
        LEFT JOIN public.users_profiles up ON u.id = up.user_id
        WHERE u.email = $1
      `;

      const result = await this.pool.query(query, [email]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        display_name: row.display_name,
        email: row.email,
        phone_number: row.phone_number,
        password_hash: row.password_hash,
        email_verified: row.email_verified,
        created_at: row.created_at,
        phone: row.phone,
        wallet_balance: row.wallet_balance || 0,
        bonus_wallet: row.bonus_wallet || 0,
        total_referrals: row.total_referrals || 0,
        referral_code: row.referral_code,
        fast_track_eligible: row.fast_track_eligible || false,
        fast_track_activated: row.fast_track_activated || false,
      };
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      return null;
    }
  }

  // Create new user
  async createUser(userData: {
    display_name: string;
    email: string;
    phone_number?: string;
    password: string;
    phone?: string;
  }): Promise<User | null> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Insert into users table first
      const userQuery = `
        INSERT INTO auth.users (
          display_name,
          email,
          phone_number,
          password_hash,
          email_verified,
          phone_number_verified,
          locale,
          avatar_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, display_name, email, phone_number, password_hash, email_verified, created_at
      `;

      const userValues = [
        userData.display_name,
        userData.email,
        userData.phone_number || null,
        hashedPassword,
        false, // email_verified
        false, // phone_number_verified
        'en', // locale
        '', // avatar_url
      ];

      const userResult = await client.query(userQuery, userValues);
      const newUser = userResult.rows[0];

      // Generate referral code
      const referralCode = this.generateReferralCode();

      // Insert into users_profiles table
      const profileQuery = `
        INSERT INTO public.users_profiles (
          user_id,
          phone,
          wallet_balance,
          bonus_wallet,
          total_referrals,
          referral_code,
          fast_track_eligible,
          fast_track_activated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING phone, wallet_balance, bonus_wallet, total_referrals, referral_code, fast_track_eligible, fast_track_activated
      `;

      const profileValues = [
        newUser.id,
        userData.phone || null,
        0, // wallet_balance
        0, // bonus_wallet
        0, // total_referrals
        referralCode,
        false, // fast_track_eligible
        false, // fast_track_activated
      ];

      const profileResult = await client.query(profileQuery, profileValues);
      const newProfile = profileResult.rows[0];

      await client.query('COMMIT');

      // Return combined user data
      return {
        id: newUser.id,
        display_name: newUser.display_name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        password_hash: newUser.password_hash,
        email_verified: newUser.email_verified,
        created_at: newUser.created_at,
        phone: newProfile.phone,
        wallet_balance: newProfile.wallet_balance,
        bonus_wallet: newProfile.bonus_wallet,
        total_referrals: newProfile.total_referrals,
        referral_code: newProfile.referral_code,
        fast_track_eligible: newProfile.fast_track_eligible,
        fast_track_activated: newProfile.fast_track_activated,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating user:', error);
      
      // Re-throw the error to preserve constraint violation details
      throw error;
    } finally {
      client.release();
    }
  }

  // Verify user password
  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.findUserByEmail(email);
      if (!user || !user.password_hash) {
        return false;
      }

      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      console.error('❌ Error verifying password:', error);
      return false;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Separate updates for users table and users_profiles table
      const userUpdates: any = {};
      const profileUpdates: any = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (['display_name', 'email', 'phone_number', 'password_hash', 'email_verified'].includes(key)) {
          userUpdates[key] = value;
        } else if (['phone', 'wallet_balance', 'bonus_wallet', 'total_referrals', 'referral_code', 'fast_track_eligible', 'fast_track_activated'].includes(key)) {
          profileUpdates[key] = value;
        }
      });

      // Update users table
      if (Object.keys(userUpdates).length > 0) {
        const userFields = Object.keys(userUpdates).map((key, index) => `${key} = $${index + 1}`).join(', ');
        const userValues = Object.values(userUpdates);
        userValues.push(userId);

        const userQuery = `UPDATE auth.users SET ${userFields} WHERE id = $${userValues.length}`;
        await client.query(userQuery, userValues);
      }

      // Update users_profiles table
      if (Object.keys(profileUpdates).length > 0) {
        const profileFields = Object.keys(profileUpdates).map((key, index) => `${key} = $${index + 1}`).join(', ');
        const profileValues = Object.values(profileUpdates);
        profileValues.push(userId);

        const profileQuery = `UPDATE public.users_profiles SET ${profileFields} WHERE user_id = $${profileValues.length}`;
        await client.query(profileQuery, profileValues);
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error updating user profile:', error);
      return false;
    } finally {
      client.release();
    }
  }

  // Generate referral code
  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Get a database client connection (for advanced queries)
  async getClient() {
    return await this.pool.connect();
  }

  // Close connection pool
  async close() {
    await this.pool.end();
  }
}

// Export singleton instance
export const directDb = new DirectDatabaseConnection();
export default directDb;
