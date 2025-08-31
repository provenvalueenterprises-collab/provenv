import { NextApiRequest, NextApiResponse } from 'next';
import { nhost } from '../../../lib/nhost';
import { emailService } from '../../../lib/email';
import { userStore } from '../../../lib/user-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, password, referral_code } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    console.log('🔄 Starting registration for:', email);
    console.log('🔧 Environment check - NEXT_PUBLIC_USE_NHOST:', process.env.NEXT_PUBLIC_USE_NHOST);

    // Generate unique referral code
    const userReferralCode = `PV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    console.log('🔄 Creating user with userStore...');
    // Create user in Nhost (password will be handled by Nhost auth)
    const user = await userStore.createUser({
      name,
      email,
      phone,
      passwordHash: password, // Nhost will hash this
      referralCode: userReferralCode,
    });

    console.log('✅ User created successfully:', user.email);

    // No email verification needed - user can login immediately

    res.status(201).json({
      message: 'Registration successful! You can now login with your credentials.',
      userId: user.id,
      needsVerification: false,
      referralCode: userReferralCode,
      emailSent: false
    });

  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
