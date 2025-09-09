import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { nhost } from '../../../lib/nhost';
import { userStore } from '../../../lib/user-store';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called with:', { identifier: credentials?.identifier });

        if (!credentials?.identifier || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          // Check if identifier is email (contains @) or phone number
          const isEmail = credentials.identifier.includes('@');
          
          // Try Nhost authentication first (only for email)
          if (isEmail && process.env.NEXT_PUBLIC_USE_NHOST !== 'false') {
            try {
              console.log('🔐 Attempting Nhost authentication for:', credentials.identifier);
              console.log('🌐 Nhost Config:', {
                subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
                region: process.env.NEXT_PUBLIC_NHOST_REGION,
                useNhost: process.env.NEXT_PUBLIC_USE_NHOST
              });

              const authResponse = await nhost.auth.signIn({
                email: credentials.identifier,
                password: credentials.password,
              });

              console.log('📋 Nhost auth response:', {
                hasError: !!authResponse.error,
                hasSession: !!authResponse.session,
                hasUser: !!authResponse.session?.user,
                error: authResponse.error
              });

              if (authResponse.error) {
                console.error('❌ Nhost auth error details:', {
                  message: authResponse.error.message,
                  status: authResponse.error.status,
                  error: authResponse.error
                });
                throw new Error(`Nhost authentication failed: ${authResponse.error.message || 'Unknown error'}`);
              }

              if (authResponse.session?.user) {
                console.log('✅ Nhost authentication successful for user:', authResponse.session.user.email);

                // Get user profile data from direct database
                console.log('🔍 Fetching user profile data from direct database...');
                const user = await userStore.findUserByEmail(credentials.identifier);

                if (user) {
                  console.log('✅ User profile found, returning complete user data');
                  return {
                    id: user.id,
                    email: user.email,
                    name: user.display_name,
                    phone: user.phone || '',
                    walletBalance: user.walletBalance || 0,
                    bonusWallet: user.bonusWallet || 0,
                    totalReferrals: user.totalReferrals || 0,
                    referralCode: user.referralCode || '',
                    emailVerified: !!user.emailVerified,
                    // Store Nhost access token for GraphQL requests
                    accessToken: authResponse.session.accessToken,
                    refreshToken: authResponse.session.refreshToken,
                  };
                } else {
                  console.log('⚠️ User authenticated but no profile found in userStore');
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
                    // Store Nhost access token for GraphQL requests
                    accessToken: authResponse.session.accessToken,
                    refreshToken: authResponse.session.refreshToken,
                  };
                }
              } else {
                console.error('❌ Nhost auth response missing session or user');
                throw new Error('Nhost authentication incomplete - no session returned');
              }
            } catch (nhostError) {
              console.error('❌ Nhost authentication failed with error:', nhostError);
              console.error('🔄 Falling back to userStore authentication');
            }
          } else {
            console.log('⏭️ Nhost authentication skipped (phone login or NEXT_PUBLIC_USE_NHOST=false)');
          }

          // Fallback to direct database authentication
          console.log('🔄 Using direct database authentication for:', credentials.identifier);
          const user = await userStore.findUserByEmailOrPhone(credentials.identifier);

          if (!user) {
            console.log('❌ User not found in database');
            throw new Error('Invalid credentials');
          }

          // For direct database, we need to verify password manually
          const isValid = await userStore.verifyPasswordByEmailOrPhone(credentials.identifier, credentials.password);

          if (!isValid) {
            console.log('❌ Invalid password');
            throw new Error('Invalid credentials');
          }

          console.log('✅ Direct database authentication successful');
          // Return user object for NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.display_name,
            phone: user.phone || '',
            walletBalance: user.walletBalance || 0,
            bonusWallet: user.bonusWallet || 0,
            totalReferrals: user.totalReferrals || 0,
            referralCode: user.referralCode || '',
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
        // Store Nhost tokens
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
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
        // Include Nhost tokens in session
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
