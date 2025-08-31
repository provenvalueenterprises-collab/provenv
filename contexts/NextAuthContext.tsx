import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  walletBalance: number;
  bonusWallet: number;
  totalReferrals: number;
  referralCode: string;
  emailVerified: boolean;
  role?: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  referral_code?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<{ needsVerification: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const loading = status === 'loading';
  
  const user: AuthUser | null = session?.user ? {
    id: session.user.id as string,
    email: session.user.email!,
    name: session.user.name!,
    phone: session.user.phone as string,
    walletBalance: session.user.walletBalance as number,
    bonusWallet: session.user.bonusWallet as number,
    totalReferrals: session.user.totalReferrals as number,
    referralCode: session.user.referralCode as string,
    emailVerified: session.user.emailVerified as boolean,
    role: session.user.role
  } : null;

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.ok) {
      router.push('/dashboard');
    }
  };

  const register = async (userData: RegisterData): Promise<{ needsVerification: boolean }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { needsVerification: data.needsVerification };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    signOut({ callbackUrl: '/' });
  };

  const refreshUser = async () => {
    // Force session update by calling getSession
    const { data } = await fetch('/api/auth/session').then(res => res.json());
    if (data) {
      // Session will be updated automatically by next-auth
      router.reload();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Type extension for NextAuth
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
    walletBalance: number;
    bonusWallet: number;
    totalReferrals: number;
    referralCode: string;
    emailVerified: boolean;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      walletBalance: number;
      bonusWallet: number;
      totalReferrals: number;
      referralCode: string;
      emailVerified: boolean;
      role?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    phone: string;
    walletBalance: number;
    bonusWallet: number;
    totalReferrals: number;
    referralCode: string;
    emailVerified: boolean;
    role?: string;
  }
}
