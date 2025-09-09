import { NextApiRequest, NextApiResponse } from 'next';
import { registrationOtpStore } from './send-registration-otp';
import { userStore } from '../../../lib/user-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phoneNumber, otp } = req.body;

  console.log('🔐 Registration OTP verification for:', phoneNumber);

  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  try {
    const storedData = registrationOtpStore.get(phoneNumber);

    if (!storedData) {
      return res.status(400).json({ 
        message: 'No verification code found. Please request a new code.' 
      });
    }

    // Check if expired
    if (Date.now() > storedData.expires) {
      registrationOtpStore.delete(phoneNumber);
      return res.status(400).json({ 
        message: 'Verification code has expired. Please request a new code.' 
      });
    }

    // Check attempts limit
    if (storedData.attempts >= 3) {
      registrationOtpStore.delete(phoneNumber);
      return res.status(400).json({ 
        message: 'Too many incorrect attempts. Please request a new code.' 
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts++;
      return res.status(400).json({ 
        message: 'Invalid verification code. Please try again.',
        attemptsRemaining: 3 - storedData.attempts
      });
    }

    console.log('✅ Registration OTP verified successfully');

    // OTP is valid, create the user
    const { registrationData } = storedData;
    
    console.log('🔄 Creating user after OTP verification...');
    const user = await userStore.createUser({
      display_name: registrationData.name,
      email: registrationData.email,
      phone: registrationData.phone,
      phone_number: registrationData.phone,
      password: registrationData.password
    });

    if (!user) {
      throw new Error('Failed to create user after OTP verification');
    }

    // Clean up OTP store
    registrationOtpStore.delete(phoneNumber);

    console.log('✅ User created successfully after OTP verification:', {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      phone: user.phone
    });

    // Generate unique referral code
    const userReferralCode = `PV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    res.status(201).json({
      success: true,
      message: 'Phone number verified and account created successfully! You can now login.',
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        phone: user.phone
      },
      referral_code: userReferralCode
    });

  } catch (error: any) {
    console.error('❌ Registration OTP verification error:', error);
    
    if (error.message?.includes('already exists')) {
      res.status(400).json({
        success: false,
        message: 'An account with this phone number already exists. Please login instead.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An error occurred during verification. Please try again.'
      });
    }
  }
}
