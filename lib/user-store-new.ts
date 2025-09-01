// Direct database user store for persistent storage
// Uses direct PostgreSQL connection for user management

import { directDb } from './direct-db';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // optional to match database schema
  passwordHash: string;
  referralCode?: string; // optional to match database schema
  emailVerified: boolean;
  createdAt: Date;
  walletBalance?: number;
  bonusWallet?: number;
  totalReferrals?: number;
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
          name: user.display_name || '', // database uses display_name, fallback to empty string
          email: user.email,
          phone: user.phone || undefined, // optional property
          passwordHash: user.password_hash,
          referralCode: user.referral_code || undefined, // optional property
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          walletBalance: user.wallet_balance,
          bonusWallet: user.bonus_wallet,
          totalReferrals: user.total_referrals,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      return null;
    }
  }

  // Create new user
  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    referral_code?: string;
  }): Promise<User | null> {
    try {
      console.log('👤 Creating new user:', userData.email);
      const user = await directDb.createUser({
        display_name: userData.name, // map name to display_name
        email: userData.email,
        phone_number: userData.phone, // map phone to phone_number
        password: userData.password,
        phone: userData.phone, // also set phone for compatibility
      });

      if (user) {
        return {
          id: user.id,
          name: user.display_name || '', // database uses display_name
          email: user.email,
          phone: user.phone || undefined, // optional property
          passwordHash: user.password_hash,
          referralCode: user.referral_code || undefined, // optional property
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          walletBalance: user.wallet_balance,
          bonusWallet: user.bonus_wallet,
          totalReferrals: user.total_referrals,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      console.log('📝 Updating user profile:', userId);

      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.passwordHash) dbUpdates.password_hash = updates.passwordHash;
      if (updates.referralCode) dbUpdates.referral_code = updates.referralCode;
      if (updates.emailVerified !== undefined) dbUpdates.email_verified = updates.emailVerified;
      if (updates.walletBalance !== undefined) dbUpdates.wallet_balance = updates.walletBalance;
      if (updates.bonusWallet !== undefined) dbUpdates.bonus_wallet = updates.bonusWallet;
      if (updates.totalReferrals !== undefined) dbUpdates.total_referrals = updates.totalReferrals;

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
}

// Export singleton instance
export const userStore = new DirectDatabaseUserStore();
export default userStore;
