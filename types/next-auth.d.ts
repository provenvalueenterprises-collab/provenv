import NextAuth from 'next-auth';

declare module 'next-auth' {
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
