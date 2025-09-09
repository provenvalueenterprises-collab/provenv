import { NextApiRequest, NextApiResponse } from 'next';
import { userStore } from '../../../lib/user-store';
import { otpStore } from './send-reset-otp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { method, identifier, otp, newPassword } = req.body;

  console.log('🔄 Reset password request:', { 
    method, 
    identifier: identifier ? 'provided' : 'missing', 
    otp: otp ? 'provided' : 'missing',
    newPassword: newPassword ? 'provided' : 'missing'
  });

  if (!method || !identifier || !otp || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const otpKey = `${method}:${identifier}`;
    const storedData = otpStore.get(otpKey);

    if (!storedData) {
      console.log('❌ No OTP found for key:', otpKey);
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check if OTP was verified (attempts = -1)
    if (storedData.attempts !== -1) {
      console.log('❌ OTP not verified for key:', otpKey);
      return res.status(400).json({ message: 'OTP not verified. Please verify OTP first.' });
    }

    // Check if OTP is still within validity period
    if (Date.now() > storedData.expires) {
      otpStore.delete(otpKey);
      console.log('❌ OTP expired during reset for key:', otpKey);
      return res.status(400).json({ message: 'OTP has expired. Please start the process again.' });
    }

    // Verify OTP one more time
    if (storedData.otp !== otp) {
      console.log('❌ OTP mismatch during reset for key:', otpKey);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Find user and update password
    let user;
    if (method === 'phone') {
      console.log('🔍 Finding user by phone for password reset:', identifier);
      user = await userStore.findUserByPhone(identifier);
    } else {
      console.log('🔍 Finding user by email for password reset:', identifier);
      user = await userStore.findUserByEmail(identifier);
    }

    if (!user) {
      console.log('❌ User not found during password reset:', identifier);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found for password reset:', { id: user.id, email: user.email });

    // Update password
    const updated = await userStore.updateUserPassword(user.id, newPassword);

    if (!updated) {
      console.log('❌ Failed to update password for user:', user.id);
      return res.status(500).json({ message: 'Failed to update password' });
    }

    // Clean up OTP
    otpStore.delete(otpKey);
    console.log('✅ Password reset successful for user:', user.id);

    res.status(200).json({
      message: 'Password reset successfully',
      success: true
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
