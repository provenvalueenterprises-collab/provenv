import { NextApiRequest, NextApiResponse } from 'next';
import { otpStore } from './send-reset-otp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { method, identifier, otp } = req.body;

  console.log('🔄 Verifying reset OTP:', { method, identifier: identifier ? 'provided' : 'missing', otp: otp ? 'provided' : 'missing' });

  if (!method || !identifier || !otp) {
    return res.status(400).json({ message: 'Method, identifier, and OTP are required' });
  }

  try {
    const otpKey = `${method}:${identifier}`;
    const storedData = otpStore.get(otpKey);

    if (!storedData) {
      console.log('❌ No OTP found for key:', otpKey);
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expires) {
      otpStore.delete(otpKey);
      console.log('❌ OTP expired for key:', otpKey);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts limit
    if (storedData.attempts >= 3) {
      otpStore.delete(otpKey);
      console.log('❌ Too many attempts for key:', otpKey);
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStore.set(otpKey, storedData);
      console.log('❌ Invalid OTP for key:', otpKey, 'Attempts:', storedData.attempts);
      return res.status(400).json({ 
        message: 'Invalid OTP. Please try again.',
        attemptsLeft: 3 - storedData.attempts
      });
    }

    console.log('✅ OTP verified successfully for:', otpKey);

    // Don't delete the OTP yet - we'll need it for password reset
    // Just mark it as verified
    storedData.attempts = -1; // Special value to indicate verified
    otpStore.set(otpKey, storedData);

    res.status(200).json({
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('❌ Verify reset OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
