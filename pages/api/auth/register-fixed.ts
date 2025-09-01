import { NextApiRequest, NextApiResponse } from 'next';
import { userStore } from '../../../lib/user-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, password, referral_code } = req.body;

  console.log('📋 Registration request body:', { name, email, phone: phone ? 'provided' : 'missing', password: password ? 'provided' : 'missing', referral_code });

  if (!name || !email || !phone || !password) {
    console.log('❌ Missing required fields:', { name: !!name, email: !!email, phone: !!phone, password: !!password });
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    console.log('🔄 Starting registration for:', email);

    console.log('🔄 Creating user with userStore...');
    // Create user in database
    const user = await userStore.createUser({
      display_name: name,
      email,
      phone,
      phone_number: phone,
      password,
    });

    if (!user) {
      console.log('❌ User creation returned null');
      throw new Error('Failed to create user - userStore returned null');
    }

    console.log('✅ User created successfully:', {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      phone: user.phone
    });

    // Generate unique referral code
    const userReferralCode = `PV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    res.status(201).json({
      message: 'Registration successful! You can now login with your credentials.',
      userId: user.id,
      needsVerification: false,
      referralCode: userReferralCode,
      emailSent: false
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
