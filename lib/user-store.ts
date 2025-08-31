// Nhost-based user store for persistent storage
// Uses Nhost database for user management

import { nhost } from './nhost';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  referralCode: string;
  emailVerified: boolean;
  createdAt: Date;
  walletBalance?: number;
  bonusWallet?: number;
  totalReferrals?: number;
}

// Fallback in-memory store for when Nhost is not available
class FallbackUserStore {
  private users: Map<string, User> = new Map();
  private initialized = false;

  constructor() {
    // Initialize test user asynchronously
    this.initializeTestUser();
  }

  private async initializeTestUser() {
    if (this.initialized) return;
    
    try {
      const hashedPassword = await bcrypt.hash('test123', 12);
      const testUser: User = {
        id: 'test-user-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        passwordHash: hashedPassword,
        referralCode: 'TEST123',
        emailVerified: true,
        createdAt: new Date(),
        walletBalance: 100.00,
        bonusWallet: 50.00,
        totalReferrals: 5,
      };
      this.users.set('test@example.com', testUser);
      this.initialized = true;
      console.log('✅ Test user initialized in fallback store:', testUser.email);
    } catch (error) {
      console.error('❌ Failed to initialize test user:', error);
    }
  }

  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    referralCode: string;
  }): Promise<User> {
    console.log('🔄 FallbackUserStore.createUser called for:', userData.email);

    // Check if user already exists
    if (this.users.has(userData.email)) {
      console.log('❌ User already exists:', userData.email);
      throw new Error('User already exists');
    }

    console.log('🔐 Hashing password...');
    // Hash the password for storage
    const hashedPassword = await bcrypt.hash(userData.passwordHash, 12);

    const user: User = {
      id: 'user-' + Date.now() + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      passwordHash: hashedPassword,
      referralCode: userData.referralCode,
      emailVerified: true,
      createdAt: new Date(),
      walletBalance: 0.00,
      bonusWallet: 0.00,
      totalReferrals: 0,
    };

    this.users.set(userData.email, user);
    console.log('✅ User created in fallback store:', user.email, 'ID:', user.id);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    // Ensure test user is initialized
    await this.initializeTestUser();
    
    const user = this.users.get(email);
    console.log(`🔍 Fallback store lookup for ${email}:`, user ? 'found' : 'not found');
    return user || null;
  }

  async verifyUserEmail(email: string): Promise<boolean> {
    const user = this.users.get(email);
    if (user) {
      user.emailVerified = true;
      console.log('User email verified in fallback store:', email);
      return true;
    }
    return false;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

const fallbackStore = new FallbackUserStore();

class UserStore {
  constructor() {
    console.log('🔧 UserStore constructor called');
    console.log('🔧 NEXT_PUBLIC_USE_NHOST:', process.env.NEXT_PUBLIC_USE_NHOST);
  }

  private get useNhost(): boolean {
    // For debugging, hardcode to false to ensure we use fallback store
    console.log('🔧 useNhost getter called - hardcoded to false for debugging');
    return false;
  }

  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    referralCode: string;
  }): Promise<User> {
    console.log('🔧 UserStore.createUser called');
    console.log('🔧 useNhost:', this.useNhost);
    console.log('🔧 NEXT_PUBLIC_USE_NHOST env:', process.env.NEXT_PUBLIC_USE_NHOST);

    if (this.useNhost) {
      try {
        return await this.createUserWithNhost(userData);
      } catch (error) {
        console.warn('Nhost user creation failed, falling back to in-memory store:', error);
        return await fallbackStore.createUser(userData);
      }
    } else {
      console.log('Using fallback in-memory store (Nhost disabled)');
      return await fallbackStore.createUser(userData);
    }
  }

  private async createUserWithNhost(userData: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    referralCode: string;
  }): Promise<User> {
    try {
      console.log('🔄 Attempting to create user with Nhost:', {
        email: userData.email,
        name: userData.name,
        subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
        region: process.env.NEXT_PUBLIC_NHOST_REGION
      });

      // First, create user in Nhost auth
      const authResponse = await nhost.auth.signUp({
        email: userData.email,
        password: userData.passwordHash,
        options: {
          displayName: userData.name,
        }
      });

      console.log('📋 Nhost auth response:', {
        hasError: !!authResponse.error,
        hasSession: !!authResponse.session,
        errorMessage: authResponse.error?.message,
        sessionKeys: authResponse.session ? Object.keys(authResponse.session) : null
      });

      if (authResponse.error) {
        // If user is already signed in, try to sign out and retry
        if (authResponse.error.message === 'User is already signed in') {
          console.log('🔄 User already signed in, attempting to clear session...');
          await nhost.auth.signOut();

          // Wait a moment for the sign out to complete
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Retry the signup
          console.log('🔄 Retrying user signup after clearing session...');
          const retryResponse = await nhost.auth.signUp({
            email: userData.email,
            password: userData.passwordHash,
            options: {
              displayName: userData.name,
            }
          });

          if (retryResponse.error) {
            console.error('❌ Nhost auth retry error details:', retryResponse.error);
            throw new Error(`Auth signup failed: ${retryResponse.error.message}`);
          }

          if (!retryResponse.session?.user) {
            console.error('❌ No user session created on retry. Full response:', retryResponse);
            throw new Error('Auth signup failed: No user session created');
          }

          console.log('✅ User created in Nhost auth on retry:', retryResponse.session!.user.id);
          // Use the retry response for the rest of the process
          (authResponse as any).session = retryResponse.session;
        } else {
          console.error('❌ Nhost auth error details:', authResponse.error);
          throw new Error(`Auth signup failed: ${authResponse.error.message}`);
        }
      }

      if (!authResponse.session?.user) {
        console.error('❌ No user session created. Full response:', authResponse);
        throw new Error('Auth signup failed: No user session created');
      }

      console.log('✅ User created in Nhost auth:', authResponse.session.user.id);

      // Then create user profile
      const { data: profileData, error: profileError } = await nhost.graphql.request(`
        mutation CreateUserProfile(
          $userId: uuid!
          $phone: String!
          $referralCode: String!
        ) {
          insert_user_profiles_one(object: {
            user_id: $userId
            phone: $phone
            referral_code: $referralCode
            wallet_balance: 0.00
            bonus_wallet: 0.00
            total_referrals: 0
          }) {
            id
            user_id
            phone
            referral_code
            wallet_balance
            bonus_wallet
            total_referrals
            created_at
          }
        }
      `, {
        userId: authResponse.session.user.id,
        phone: userData.phone,
        referralCode: userData.referralCode,
      });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        console.error('❌ Full error details:', JSON.stringify(profileError, null, 2));

        // Check if this is an RLS policy error
        const errorMessage = Array.isArray(profileError)
          ? profileError.map(e => e.message).join(', ')
          : (profileError as any)?.message || 'Unknown error';

        if (errorMessage.includes('policy') || errorMessage.includes('permission') || errorMessage.includes('RLS')) {
          console.error('🚨 RLS POLICY ERROR: The user_profiles table INSERT policy is failing!');
          console.error('🚨 This usually means auth.uid() or auth.role() functions are not available in your Nhost setup');
          console.error('🚨 QUICK FIX: Run quick-disable-rls.sql to temporarily disable RLS for testing');
          console.error('🚨 PERMANENT FIX: Run auth-function-solutions.sql for various solutions');
        }

        console.warn('⚠️ User created in auth but profile creation failed. User can still login with basic info.');

        // Return user with basic info even if profile creation failed
        const user: User = {
          id: authResponse.session.user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          passwordHash: userData.passwordHash,
          referralCode: userData.referralCode,
          emailVerified: authResponse.session.user.emailVerified || false,
          createdAt: new Date(),
          walletBalance: 0.00,
          bonusWallet: 0.00,
          totalReferrals: 0,
        };

        console.log('✅ User created in Nhost auth (profile creation failed):', user.email);
        return user;
      }

      console.log('✅ User and profile created in Nhost:', userData.email);

      const user: User = {
        id: authResponse.session.user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        passwordHash: userData.passwordHash,
        referralCode: userData.referralCode,
        emailVerified: authResponse.session.user.emailVerified || false, // Use actual verification status
        createdAt: new Date(),
        walletBalance: 0.00,
        bonusWallet: 0.00,
        totalReferrals: 0,
      };

      console.log('✅ User created in Nhost:', user.email, 'Verified:', user.emailVerified);
      return user;
    } catch (error) {
      console.error('❌ User creation error:', error);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (this.useNhost) {
      try {
        return await this.findUserByEmailWithNhost(email);
      } catch (error) {
        console.warn('Nhost user lookup failed, falling back to in-memory store:', error);
        return await fallbackStore.findUserByEmail(email);
      }
    } else {
      return await fallbackStore.findUserByEmail(email);
    }
  }

  private async findUserByEmailWithNhost(email: string): Promise<User | null> {
    try {
      console.log('🔍 Searching for user in Nhost:', email);

      // First try to find user profile
      const { data: profileData, error: profileError } = await nhost.graphql.request(`
        query FindUserByEmail($email: String!) {
          user_profiles(where: {users: {email: {_eq: $email}}}) {
            id
            user_id
            phone
            referral_code
            wallet_balance
            bonus_wallet
            total_referrals
            created_at
            users {
              id
              email
              display_name
              email_verified
              created_at
            }
          }
        }
      `, { email });

      if (!profileError && profileData?.user_profiles && profileData.user_profiles.length > 0) {
        // User profile found
        const profile = profileData.user_profiles[0];
        const authUser = profile.users;

        console.log('✅ User profile found in Nhost:', email);
        return {
          id: authUser.id,
          name: profile.users?.display_name || authUser.display_name || '',
          email: profile.users?.email || authUser.email,
          phone: profile.phone,
          passwordHash: '',
          referralCode: profile.referral_code,
          emailVerified: authUser.email_verified || false,
          createdAt: new Date(profile.created_at),
          walletBalance: parseFloat(profile.wallet_balance || '0'),
          bonusWallet: parseFloat(profile.bonus_wallet || '0'),
          totalReferrals: profile.total_referrals || 0,
        };
      }

      // If profile not found, try to find user in Nhost auth directly
      console.log('🔍 Profile not found, checking Nhost auth directly...');
      const { data: authData, error: authError } = await nhost.graphql.request(`
        query FindAuthUserByEmail($email: String!) {
          users(where: {email: {_eq: $email}}) {
            id
            email
            display_name
            email_verified
            created_at
          }
        }
      `, { email });

      if (!authError && authData?.users && authData.users.length > 0) {
        const authUser = authData.users[0];

        console.log('✅ User found in Nhost auth (no profile):', email);

        // Try to create the missing profile
        const profileCreated = await this.createUserProfileIfMissing(authUser.id, {
          name: authUser.display_name || '',
          email: authUser.email,
          phone: '',
          referralCode: '',
        });

        if (profileCreated) {
          console.log('✅ Profile created for existing auth user:', email);
          // Now try to find the user again with the profile
          return await this.findUserByEmailWithNhost(email);
        }

        // Create a basic user object without profile data
        return {
          id: authUser.id,
          name: authUser.display_name || '',
          email: authUser.email,
          phone: '',
          passwordHash: '',
          referralCode: '',
          emailVerified: authUser.email_verified || false,
          createdAt: new Date(authUser.created_at),
          walletBalance: 0.00,
          bonusWallet: 0.00,
          totalReferrals: 0,
        };
      }

      console.log('ℹ️ User not found in Nhost:', email);
      return null;

    } catch (error) {
      console.error('❌ Find user by email error:', error);
      return null;
    }
  }

  async verifyUserEmail(email: string): Promise<boolean> {
    if (this.useNhost) {
      try {
        return await this.verifyUserEmailWithNhost(email);
      } catch (error) {
        console.warn('Nhost email verification failed, falling back to in-memory store:', error);
        return await fallbackStore.verifyUserEmail(email);
      }
    } else {
      return await fallbackStore.verifyUserEmail(email);
    }
  }

  private async verifyUserEmailWithNhost(email: string): Promise<boolean> {
    try {
      // Nhost handles email verification automatically
      // We can update the profile if needed
      const { data, error } = await nhost.graphql.request(`
        mutation VerifyUserEmail($email: String!) {
          update_user_profiles(
            where: {email: {_eq: $email}}
            _set: {email_verified: true}
          ) {
            affected_rows
          }
        }
      `, { email });

      if (error) {
        console.error('Email verification error:', error);
        return false;
      }

      console.log('User email verified in Nhost:', email);
      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      return false;
    }
  }

  async createUserProfileIfMissing(userId: string, userData: {
    name: string;
    email: string;
    phone: string;
    referralCode: string;
  }): Promise<boolean> {
    if (!this.useNhost) {
      console.log('Profile creation skipped (Nhost disabled)');
      return false;
    }

    try {
      console.log('🔄 Checking if profile exists for user:', userId);

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await nhost.graphql.request(`
        query CheckUserProfile($userId: uuid!) {
          user_profiles(where: {user_id: {_eq: $userId}}) {
            id
          }
        }
      `, { userId });

      if (checkError) {
        console.error('❌ Profile check error:', checkError);
        return false;
      }

      if (existingProfile?.user_profiles && existingProfile.user_profiles.length > 0) {
        console.log('✅ Profile already exists for user:', userId);
        return true;
      }

      // Create the missing profile
      console.log('🔄 Creating missing profile for user:', userId);
      const { data: profileData, error: profileError } = await nhost.graphql.request(`
        mutation CreateUserProfile(
          $userId: uuid!
          $phone: String!
          $referralCode: String!
        ) {
          insert_user_profiles_one(object: {
            user_id: $userId
            phone: $phone
            referral_code: $referralCode
            wallet_balance: 0.00
            bonus_wallet: 0.00
            total_referrals: 0
          }) {
            id
          }
        }
      `, {
        userId,
        phone: userData.phone,
        referralCode: userData.referralCode,
      });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        return false;
      }

      console.log('✅ Profile created successfully for user:', userId);
      return true;

    } catch (error) {
      console.error('❌ Create profile if missing error:', error);
      return false;
    }
  }

  private async getAllUsersWithNhost(): Promise<User[]> {
    try {
      const { data, error } = await nhost.graphql.request(`
        query GetAllUsers {
          user_profiles {
            id
            user_id
            display_name
            email
            phone
            referral_code
            wallet_balance
            bonus_wallet
            total_referrals
            created_at
            users {
              id
              email
              display_name
              email_verified
              created_at
            }
          }
        }
      `);

      if (error) {
        console.error('Get all users error:', error);
        return [];
      }

      return (data?.user_profiles || []).map((profile: any) => ({
        id: profile.users.id,
        name: profile.users?.display_name || profile.users.display_name || '',
        email: profile.users?.email || profile.users.email,
        phone: profile.phone,
        passwordHash: '',
        referralCode: profile.referral_code,
        emailVerified: profile.users.email_verified || false,
        createdAt: new Date(profile.created_at),
        walletBalance: parseFloat(profile.wallet_balance || '0'),
        bonusWallet: parseFloat(profile.bonus_wallet || '0'),
        totalReferrals: profile.total_referrals || 0,
      }));
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }
}

export const userStore = new UserStore();
