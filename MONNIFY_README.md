# Monnify Payment Integration

This document explains how to use the Monnify payment integration in the Proven Value thrift savings application.

## Overview

The payment system integrates with Monnify to handle secure payments for:
- Wallet top-ups
- Thrift contributions
- Other payment types

## Environment Variables

Make sure these are set in your `.env.local` file:

```bash
# Monnify Payment Gateway
NEXT_PUBLIC_MONNIFY_API_KEY=MK_TEST_4VRD3D43D2
NEXT_PUBLIC_MONNIFY_CONTRACT_CODE=7289175723
NEXT_PUBLIC_MONNIFY_SECRET_KEY=RL1ZKQ2U9H48UMT7ARB0XK73VT0QPKNL
NEXT_PUBLIC_MONNIFY_BASE_URL=https://sandbox-api.monnify.com
```

## API Endpoints

### 1. Initiate Payment
**Endpoint:** `POST /api/payments/initiate`

**Request Body:**
```json
{
  "amount": 5000,
  "paymentType": "wallet_topup",
  "thriftPlanId": "optional-plan-id",
  "description": "Optional payment description"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.monnify.com/...",
  "paymentReference": "PV_1234567890_user123_wallet_topup"
}
```

### 2. Payment Webhook
**Endpoint:** `POST /api/payments/webhook`

This endpoint receives payment status updates from Monnify.

### 3. Verify Payment
**Endpoint:** `GET /api/payments/verify/[reference]`

**Response:**
```json
{
  "success": true,
  "verified": true,
  "paymentData": {
    "reference": "PV_1234567890_user123_wallet_topup",
    "amount": 5000,
    "status": "PAID",
    "customer": {
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

## Components

### PaymentForm Component

```tsx
import PaymentForm from '../components/PaymentForm';

function MyComponent() {
  return (
    <PaymentForm
      amount={5000}
      paymentType="wallet_topup"
      thriftPlanId="optional-id"
      onSuccess={(data) => console.log('Payment initiated:', data)}
      onError={(error) => console.error('Payment error:', error)}
    />
  );
}
```

## Payment Flow

1. **User initiates payment** → Calls `/api/payments/initiate`
2. **Monnify creates checkout URL** → User redirected to Monnify
3. **User completes payment** → Monnify processes payment
4. **Webhook notification** → `/api/payments/webhook` receives update
5. **Payment verification** → System verifies payment status
6. **Success redirect** → User redirected to success page

## Supported Payment Methods

- 💳 **Credit/Debit Cards**
- 🏦 **Bank Transfers**
- 📱 **USSD**
- 💰 **Bank Account Payments**

## Testing

Use the test credentials provided for sandbox testing:

- **Test API Key:** `MK_TEST_4VRD3D43D2`
- **Test Contract Code:** `7289175723`
- **Test Secret Key:** `RL1ZKQ2U9H48UMT7ARB0XK73VT0QPKNL`

## Webhook Configuration

Configure your webhook URL in the Monnify dashboard:
- **URL:** `https://yourdomain.com/api/payments/webhook`
- **Events:** `SUCCESSFUL_TRANSACTION`

## Error Handling

The system includes comprehensive error handling for:
- Network failures
- Authentication errors
- Payment failures
- Invalid requests

## Security

- All payments are processed through Monnify's secure gateway
- Webhook signatures should be verified (TODO: implement signature verification)
- Sensitive data is never stored in the application
- All API calls use HTTPS

## Next Steps

1. Implement database operations for payment records
2. Add webhook signature verification
3. Implement payment status tracking
4. Add payment history and receipts
5. Configure production credentials when ready
