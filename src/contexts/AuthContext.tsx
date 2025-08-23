import React, { createContext, useContext, useState, useEffect } from 'react';
import { nhost } from '../lib/nhost';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  wallet_balance: number;
  bonus_wallet: number;
  total_referrals: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  referral_code?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('proven_value_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { session, error } = await nhost.auth.signIn({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (session) {
        // Fetch user profile data
        const { data: userData } = await nhost.graphql.request(`
          query GetUser($id: uuid!) {
            user(id: $id) {
              id
              email
              displayName
              metadata
              defaultRole
            }
            users_profiles(where: {user_id: {_eq: $id}}) {
              phone
              wallet_balance
              bonus_wallet
              total_referrals
              created_at
            }
          }
        `, { id: session.user.id });

        const profile = userData?.users_profiles?.[0];
        const user = userData?.user;

        const userProfile: User = {
          id: user.id,
          email: user.email,
          name: user.displayName || 'User',
          role: user.defaultRole === 'admin' ? 'admin' : 'user',
          phone: profile?.phone,
          wallet_balance: profile?.wallet_balance || 0,
          bonus_wallet: profile?.bonus_wallet || 0,
          total_referrals: profile?.total_referrals || 0,
          created_at: profile?.created_at || new Date().toISOString()
        };

        setUser(userProfile);
      }
    } catch (error) {
      throw new Error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const { session, error } = await nhost.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          displayName: userData.name,
          metadata: {
            phone: userData.phone,
            referral_code: userData.referral_code
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (session) {
        // Create user profile
        await nhost.graphql.request(`
          mutation CreateUserProfile($user_id: uuid!, $phone: String, $referral_code: String) {
            insert_users_profiles_one(object: {
              user_id: $user_id,
              phone: $phone,
              wallet_balance: 0,
              bonus_wallet: 0,
              total_referrals: 0,
              referral_code: $referral_code
            }) {
              id
            }
          }
        `, {
          user_id: session.user.id,
          phone: userData.phone,
          referral_code: userData.referral_code
        });

        const newUser: User = {
          id: session.user.id,
          email: userData.email,
          name: userData.name,
          role: 'user',
          phone: userData.phone,
          wallet_balance: 0,
          bonus_wallet: 0,
          total_referrals: 0,
          created_at: new Date().toISOString()
        };

        setUser(newUser);
      }
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    nhost.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};