import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { nhost } from '../../../lib/nhost';
import { userStore } from '../../../lib/user-store';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called with:', { email: credentials?.email });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          // Try Nhost authentication first
          if (process.env.NEXT_PUBLIC_USE_NHOST !== 'false') {
            try {
              console.log('Attempting Nhost authentication for:', credentials.email);

              const authResponse = await nhost.auth.signIn({
                email: credentials.email,
                password: credentials.password,
              });

              if (authResponse.error) {
                console.log('Nhost auth error:', authResponse.error);
                throw new Error(authResponse.error.message || 'Nhost authentication failed');
              }

              if (authResponse.session?.user) {
                console.log('Nhost authentication successful');

                // Get user profile data from Nhost
                const user = await userStore.findUserByEmail(credentials.email);

                if (user) {
                  console.log('User profile found, returning user data');
                  return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    walletBalance: user.walletBalance || 0,
                    bonusWallet: user.bonusWallet || 0,
                    totalReferrals: user.totalReferrals || 0,
                    referralCode: user.referralCode,
                    emailVerified: !!user.emailVerified,
                  };
                } else {
                  console.log('User authenticated but no profile found');
                  // Return basic user data from Nhost session
                  return {
                    id: authResponse.session.user.id,
                    email: authResponse.session.user.email || '',
                    name: authResponse.session.user.displayName || '',
                    phone: '',
                    walletBalance: 0,
                    bonusWallet: 0,
                    totalReferrals: 0,
                    referralCode: '',
                    emailVerified: !!authResponse.session.user.emailVerified,
                  };
                }
              }
            } catch (nhostError) {
              console.warn('Nhost authentication failed, trying fallback:', nhostError);
            }
          }

          // Fallback to userStore authentication
          console.log('Using fallback authentication for:', credentials.email);
          const user = await userStore.findUserByEmail(credentials.email);

          if (!user) {
            console.log('User not found in fallback store');
            throw new Error('Invalid credentials');
          }

          // For fallback, we need to verify password manually
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isValid) {
            console.log('Invalid password in fallback store');
            throw new Error('Invalid credentials');
          }

          console.log('Fallback authentication successful');
          // Return user object for NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            walletBalance: user.walletBalance || 0,
            bonusWallet: user.bonusWallet || 0,
            totalReferrals: user.totalReferrals || 0,
            referralCode: user.referralCode,
            emailVerified: !!user.emailVerified,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.walletBalance = user.walletBalance;
        token.bonusWallet = user.bonusWallet;
        token.totalReferrals = user.totalReferrals;
        token.referralCode = user.referralCode;
        token.emailVerified = !!user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.walletBalance = token.walletBalance as number;
        session.user.bonusWallet = token.bonusWallet as number;
        session.user.totalReferrals = token.totalReferrals as number;
        session.user.referralCode = token.referralCode as string;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
