# BulkSMSNigeria Integration Guide

This guide covers the implementation of BulkSMSNigeria SMS service for OTP verification in the PROVENV application.

## Overview

The BulkSMSNigeria integration provides:
- Phone number verification during registration
- Password reset via SMS OTP
- Secure Nigerian phone number handling
- Development mode for testing without SMS costs

## Setup

### 1. Environment Variables

Add these variables to your `.env.local` file:

```env
# BulkSMSNigeria Configuration
BULKSMS_API_TOKEN=your_api_token_here
BULKSMS_SENDER_ID=PROVENV
```

### 2. Get API Credentials

1. Sign up at [BulkSMSNigeria.com](https://www.bulksmsnigeria.com)
2. Complete account verification
3. Purchase SMS credits
4. Get your API token from the dashboard
5. Register your sender ID (e.g., "PROVENV")

## Implementation

### Core Service (`lib/bulksms.ts`)

The main BulkSMS service provides:

```typescript
import { bulkSMS } from '../lib/bulksms';

// Send OTP
await bulkSMS.sendOTP(phoneNumber, otp, expiryMinutes);

// Send password reset OTP
await bulkSMS.sendPasswordResetOTP(phoneNumber, otp);

// Check account balance
await bulkSMS.getBalance();

// Validate Nigerian phone number
bulkSMS.isValidNigerianPhone(phoneNumber);
```

### API Endpoints

#### Registration with OTP
- `POST /api/auth/send-registration-otp` - Send OTP for registration
- `POST /api/auth/verify-registration-otp` - Verify OTP and create account

#### Password Reset
- `POST /api/auth/send-reset-otp` - Send password reset OTP
- `POST /api/auth/verify-reset-otp` - Verify reset OTP
- `POST /api/auth/reset-password` - Reset password with verified OTP

### Frontend Pages

#### Registration with OTP (`/register-with-otp`)
Multi-step registration process:
1. **Form Step**: Collect user details
2. **OTP Step**: Verify phone number
3. **Success Step**: Account created confirmation

#### Standard Registration (`/register`)
- Email-only registration (no OTP)
- Phone + Email registration with auto-login

## Phone Number Handling

### Nigerian Phone Number Formats

The service automatically handles these formats:

```
Input: 08031234567    → Output: 2348031234567
Input: +2348031234567 → Output: 2348031234567
Input: 2348031234567  → Output: 2348031234567
Input: 8031234567     → Output: 2348031234567
```

### Validation

Nigerian mobile numbers must:
- Start with 234 (country code)
- Follow pattern: 234[7-9][0-1]XXXXXXXX
- Be exactly 13 digits total

Valid prefixes: 234701, 234702, 234703, 234704, 234705, 234706, 234707, 234708, 234709, 234801, 234802, 234803, 234804, 234805, 234806, 234807, 234808, 234809, 234901, 234902, 234903, 234904, 234905, 234906, 234907, 234908, 234909

## Security Features

### OTP Security
- 6-digit random OTP generation
- 10-minute expiration time
- Maximum 3 verification attempts
- Automatic cleanup of expired OTPs

### Rate Limiting
- Prevent OTP spam
- Account lockout after failed attempts
- Phone number verification before sending

### Data Protection
- OTPs stored temporarily in memory
- No sensitive data in logs (development mode shows OTP for testing)
- Secure password hashing

## Development Mode

When `BULKSMS_API_TOKEN` is not set:
- SMS sending is simulated
- OTP codes are logged to console
- No actual SMS costs incurred
- Full functionality for testing

## Production Considerations

### Redis Integration (Recommended)

For production, replace the in-memory OTP store with Redis:

```typescript
// Install Redis client
npm install redis @types/redis

// Update OTP storage
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// Store OTP
await redis.setex(`otp:${phoneNumber}`, 600, JSON.stringify(otpData));

// Retrieve OTP
const data = await redis.get(`otp:${phoneNumber}`);
```

### Error Monitoring

Monitor these metrics:
- SMS delivery success rate
- OTP verification success rate
- Account balance alerts
- API response times

### Cost Management

- Monitor SMS usage
- Set up account balance alerts
- Implement daily/monthly SMS limits
- Use development mode for testing

## API Response Examples

### Successful OTP Send
```json
{
  "success": true,
  "message": "Verification code sent to your phone number. Please check your messages.",
  "phoneNumber": "+2348031234567"
}
```

### OTP Verification Success
```json
{
  "success": true,
  "message": "Phone number verified and account created successfully!",
  "user": {
    "id": "user_id",
    "display_name": "John Doe",
    "phone": "+2348031234567",
    "phone_verified": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid verification code. Please try again.",
  "attemptsRemaining": 2
}
```

## Testing

### Test Registration Flow
1. Visit `/register-with-otp`
2. Enter valid Nigerian phone number
3. Complete registration form
4. Check console for OTP (development mode)
5. Enter OTP to verify

### Test Password Reset
1. Visit `/forgot-password`
2. Select "Phone Number" method
3. Enter registered phone number
4. Check console for OTP (development mode)
5. Enter OTP and reset password

## Troubleshooting

### Common Issues

**SMS not received:**
- Check phone number format
- Verify account balance
- Check BulkSMS account status
- Ensure sender ID is approved

**API errors:**
- Verify API token is correct
- Check account balance
- Ensure proper request format
- Monitor rate limits

**Phone validation fails:**
- Ensure Nigerian phone number format
- Check country code (+234)
- Verify mobile number prefixes

### Debug Mode

Enable debug logging:
```typescript
// In development
console.log('📱 SMS Debug:', {
  to: phoneNumber,
  message: otpMessage,
  provider: 'BulkSMSNigeria',
  timestamp: new Date().toISOString()
});
```

## Migration from Other Providers

### From Twilio
- Replace Twilio client with BulkSMS service
- Update phone number formatting
- Adjust error handling
- Update webhook handlers

### From AWS SNS
- Replace AWS SDK calls
- Update credential management
- Modify response parsing
- Update logging format

## Support

For technical issues:
1. Check BulkSMSNigeria documentation
2. Verify account setup and balance
3. Test with development mode first
4. Contact BulkSMSNigeria support for delivery issues

## Changelog

### v1.0.0
- Initial BulkSMSNigeria integration
- Registration OTP verification
- Password reset via SMS
- Nigerian phone number validation
- Development mode support
