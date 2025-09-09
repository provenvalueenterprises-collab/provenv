import { NextApiRequest, NextApiResponse } from 'next';
import { userStore } from '../../../lib/user-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, password, referral_code } = req.body;

  console.log('📋 Registration request body:', { 
    name, 
    email: email || 'not provided', 
    phone: phone || 'not provided', 
    password: password ? 'provided' : 'missing', 
    referral_code 
  });

  if (!name || !password) {
    console.log('❌ Missing required fields: name or password');
    return res.status(400).json({ message: 'Name and password are required' });
  }

  // Require at least one: phone OR email
  if (!phone && !email) {
    console.log('❌ Missing identifier: need phone or email');
    return res.status(400).json({ message: 'Either phone number or email address is required' });
  }

  try {
    console.log('🔄 Starting registration for:', email);

    console.log('🔄 Creating user with userStore...');
    // Create user in database
    const user = await userStore.createUser({
      display_name: name,
      email: email || null, // Email is optional
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
    
    // Handle specific database constraint violations
    if (error instanceof Error) {
      // Check for PostgreSQL unique constraint violations
      if (error.message.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('users_email_key') || error.message.includes('email')) {
          return res.status(400).json({
            message: 'An account with this email address already exists. Please use a different email or try logging in.',
            error: 'EMAIL_ALREADY_EXISTS'
          });
        }
        if (error.message.includes('users_phone_number_key') || error.message.includes('phone_number')) {
          return res.status(400).json({
            message: 'An account with this phone number already exists. Please use a different phone number or try logging in.',
            error: 'PHONE_ALREADY_EXISTS'
          });
        }
      }
      
      // Handle the case where userStore returned null due to constraints
      if (error.message.includes('userStore returned null')) {
        return res.status(400).json({
          message: 'Registration failed. The email or phone number may already be in use.',
          error: 'DUPLICATE_USER_DATA'
        });
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
