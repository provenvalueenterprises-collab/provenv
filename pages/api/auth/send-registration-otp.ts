import { NextApiRequest, NextApiResponse } from 'next';
import { bulkSMS } from '../../../lib/bulksms';

// Store registration OTPs temporarily (in production, use Redis or database)
const registrationOtpStore = new Map<string, { 
  otp: string; 
  expires: number; 
  attempts: number;
  registrationData: any;
}>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phoneNumber, name, email, password, referral_code } = req.body;

  console.log('📱 Registration OTP request for:', phoneNumber);

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  if (!name || !password) {
    return res.status(400).json({ message: 'Name and password are required' });
  }

  try {
    // Validate phone number format
    if (!bulkSMS.isValidNigerianPhone(phoneNumber)) {
      return res.status(400).json({ 
        message: 'Please enter a valid Nigerian phone number (e.g., 08031234567)' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + (10 * 60 * 1000); // 10 minutes

    // Store OTP with registration data
    registrationOtpStore.set(phoneNumber, {
      otp,
      expires,
      attempts: 0,
      registrationData: {
        name,
        email: email || null,
        phone: phoneNumber,
        password,
        referral_code
      }
    });

    console.log(`🔐 Generated registration OTP for ${phoneNumber}: ${otp}`);

    // Send OTP via SMS
    const result = await bulkSMS.sendOTP(phoneNumber, otp, 10);

    if (result.success) {
      console.log('✅ Registration OTP sent successfully');
      res.status(200).json({
        success: true,
        message: 'Verification code sent to your phone number. Please check your messages.',
        phoneNumber
      });
    } else {
      console.error('❌ Failed to send registration OTP:', result.message);
      
      // Remove from store if SMS failed
      registrationOtpStore.delete(phoneNumber);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.'
      });
    }

  } catch (error: any) {
    console.error('❌ Registration OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending verification code'
    });
  }
}

// Export the store for use in verification endpoint
export { registrationOtpStore };
