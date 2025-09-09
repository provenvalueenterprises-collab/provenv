import { NextApiRequest, NextApiResponse } from 'next';
import { userStore } from '../../../lib/user-store';
import { bulkSMS } from '../../../lib/bulksms';

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via SMS using BulkSMSNigeria
async function sendSMS(phone: string, otp: string): Promise<boolean> {
  try {
    console.log(`📱 Sending SMS OTP to ${phone}: ${otp}`);
    const result = await bulkSMS.sendPasswordResetOTP(phone, otp);
    
    if (result.success) {
      console.log('✅ SMS sent successfully via BulkSMSNigeria');
      return true;
    } else {
      console.error('❌ Failed to send SMS:', result.message);
      return false;
    }
  } catch (error) {
    console.error('❌ SMS sending error:', error);
    return false;
  }
}

// Send OTP via Email (placeholder - integrate with email provider)
async function sendEmail(email: string, otp: string): Promise<boolean> {
  console.log(`📧 Sending Email OTP to ${email}: ${otp}`);
  // TODO: Integrate with email provider (SendGrid, etc.)
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { method, identifier } = req.body;

  console.log('🔄 Password reset OTP request:', { method, identifier: identifier ? 'provided' : 'missing' });

  if (!method || !identifier) {
    return res.status(400).json({ message: 'Method and identifier are required' });
  }

  if (method !== 'phone' && method !== 'email') {
    return res.status(400).json({ message: 'Method must be phone or email' });
  }

  try {
    let user;
    
    if (method === 'phone') {
      console.log('🔍 Finding user by phone:', identifier);
      user = await userStore.findUserByPhone(identifier);
    } else {
      console.log('🔍 Finding user by email:', identifier);
      user = await userStore.findUserByEmail(identifier);
    }

    if (!user) {
      console.log('❌ User not found for identifier:', identifier);
      return res.status(404).json({ 
        message: `No account found with this ${method === 'phone' ? 'phone number' : 'email address'}` 
      });
    }

    console.log('✅ User found:', { id: user.id, email: user.email, phone: user.phone });

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    const otpKey = `${method}:${identifier}`;
    otpStore.set(otpKey, { otp, expires, attempts: 0 });

    console.log('🔑 Generated OTP for:', otpKey);

    // Send OTP
    let sent = false;
    if (method === 'phone') {
      sent = await sendSMS(identifier, otp);
    } else {
      sent = await sendEmail(identifier, otp);
    }

    if (!sent) {
      otpStore.delete(otpKey);
      return res.status(500).json({ 
        message: `Failed to send OTP to ${method === 'phone' ? 'phone number' : 'email'}` 
      });
    }

    console.log('✅ OTP sent successfully to:', identifier);

    res.status(200).json({
      message: `OTP sent to your ${method === 'phone' ? 'phone number' : 'email address'}`,
      expiresIn: 600 // 10 minutes
    });

  } catch (error) {
    console.error('❌ Send reset OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Cleanup expired OTPs (run periodically)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expires < now) {
      otpStore.delete(key);
      console.log('🧹 Cleaned up expired OTP:', key);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

// Export for verification endpoint
export { otpStore };
