// Direct database user store for persistent storage
// Uses direct PostgreSQL connection for user management

import { directDb } from './direct-db';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  phone_number?: string;
  passwordHash: string;
  referralCode?: string;
  emailVerified: boolean;
  createdAt: Date;
  walletBalance?: number;
  bonusWallet?: number;
  totalReferrals?: number;
  fastTrackEligible?: boolean;
  fastTrackActivated?: boolean;
}

// Direct database user store
class DirectDatabaseUserStore {
  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('🔍 Finding user by email:', email);
      const user = await directDb.findUserByEmail(email);

      if (user) {
        return {
          id: user.id,
          display_name: user.display_name,
          email: user.email,
          phone: user.phone,
          phone_number: user.phone_number,
          passwordHash: user.password_hash,
          referralCode: user.referral_code,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          walletBalance: user.wallet_balance,
          bonusWallet: user.bonus_wallet,
          totalReferrals: user.total_referrals,
          fastTrackEligible: user.fast_track_eligible,
          fastTrackActivated: user.fast_track_activated,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      return null;
    }
  }

  // Find user by phone number
  async findUserByPhone(phone: string): Promise<User | null> {
    try {
      console.log('🔍 Finding user by phone:', phone);
      const user = await directDb.findUserByPhone(phone);

      if (user) {
        return {
          id: user.id,
          display_name: user.display_name,
          email: user.email,
          phone: user.phone,
          phone_number: user.phone_number,
          passwordHash: user.password_hash,
          referralCode: user.referral_code,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          walletBalance: user.wallet_balance,
          bonusWallet: user.bonus_wallet,
          totalReferrals: user.total_referrals,
          fastTrackEligible: user.fast_track_eligible,
          fastTrackActivated: user.fast_track_activated,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error finding user by phone:', error);
      return null;
    }
  }

  // Create new user
  async createUser(userData: {
    display_name: string;
    email: string | null;
    phone?: string;
    phone_number?: string;
    password: string;
  }): Promise<User | null> {
    try {
      console.log('👤 Creating new user:', userData.email);
      const user = await directDb.createUser(userData);

      if (user) {
        return {
          id: user.id,
          display_name: user.display_name,
          email: user.email,
          phone: user.phone,
          phone_number: user.phone_number,
          passwordHash: user.password_hash,
          referralCode: user.referral_code,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          walletBalance: user.wallet_balance,
          bonusWallet: user.bonus_wallet,
          totalReferrals: user.total_referrals,
          fastTrackEligible: user.fast_track_eligible,
          fastTrackActivated: user.fast_track_activated,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      // Re-throw the error to preserve constraint violation details
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      console.log('📝 Updating user profile:', userId);

      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.display_name) dbUpdates.display_name = updates.display_name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.phone_number) dbUpdates.phone_number = updates.phone_number;
      if (updates.passwordHash) dbUpdates.password_hash = updates.passwordHash;
      if (updates.referralCode) dbUpdates.referral_code = updates.referralCode;
      if (updates.emailVerified !== undefined) dbUpdates.email_verified = updates.emailVerified;
      if (updates.walletBalance !== undefined) dbUpdates.wallet_balance = updates.walletBalance;
      if (updates.bonusWallet !== undefined) dbUpdates.bonus_wallet = updates.bonusWallet;
      if (updates.totalReferrals !== undefined) dbUpdates.total_referrals = updates.totalReferrals;
      if (updates.fastTrackEligible !== undefined) dbUpdates.fast_track_eligible = updates.fastTrackEligible;
      if (updates.fastTrackActivated !== undefined) dbUpdates.fast_track_activated = updates.fastTrackActivated;

      return await directDb.updateUserProfile(userId, dbUpdates);
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return false;
    }
  }

  // Verify user password
  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Verifying password for:', email);
      return await directDb.verifyPassword(email, password);
    } catch (error) {
      console.error('❌ Error verifying password:', error);
      return false;
    }
  }

  // Verify user password by phone
  async verifyPasswordByPhone(phone: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Verifying password for phone:', phone);
      return await directDb.verifyPasswordByPhone(phone, password);
    } catch (error) {
      console.error('❌ Error verifying password by phone:', error);
      return false;
    }
  }

  // Find user by email or phone
  async findUserByEmailOrPhone(identifier: string): Promise<User | null> {
    try {
      console.log('🔍 Finding user by email or phone:', identifier);
      
      // Check if identifier looks like an email (contains @)
      if (identifier.includes('@')) {
        return await this.findUserByEmail(identifier);
      } else {
        return await this.findUserByPhone(identifier);
      }
    } catch (error) {
      console.error('❌ Error finding user by email or phone:', error);
      return null;
    }
  }

  // Verify password for email or phone login
  async verifyPasswordByEmailOrPhone(identifier: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Verifying password for identifier:', identifier);
      
      // Check if identifier looks like an email (contains @)
      if (identifier.includes('@')) {
        return await this.verifyPassword(identifier, password);
      } else {
        return await this.verifyPasswordByPhone(identifier, password);
      }
    } catch (error) {
      console.error('❌ Error verifying password by identifier:', error);
      return false;
    }
  }

  // Update user password (convenience method for password reset)
  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      console.log('🔐 Updating password for user:', userId);
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      return await this.updateUserProfile(userId, { passwordHash: hashedPassword });
    } catch (error) {
      console.error('❌ Error updating user password:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userStore = new DirectDatabaseUserStore();
export default userStore;
