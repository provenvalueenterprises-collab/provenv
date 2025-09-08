# Flutterwave Test Setup Guide

## Step 1: Get Your Flutterwave Test Credentials

1. **Go to Flutterwave Dashboard**: https://dashboard.flutterwave.com/
2. **Sign up or log in** to your account
3. **Navigate to Settings > API Keys**
4. **Copy your Test credentials**:
   - Test Public Key (starts with `FLWPUBK_TEST-`)
   - Test Secret Key (starts with `FLWSECK_TEST-`)
   - Test Encryption Key

## Step 2: Update Your .env File

Replace the placeholder keys in your `.env` file with your actual test keys:

```env
# Flutterwave Configuration (Your Real Test Keys)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-actual-public-key-here
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-actual-secret-key-here
FLUTTERWAVE_ENCRYPTION_KEY=your-actual-encryption-key-here
FLUTTERWAVE_WEBHOOK_SECRET_HASH=your-webhook-secret-here

# Flutterwave Test Environment
FLUTTERWAVE_ENVIRONMENT=sandbox
```

## Step 3: Test the Payment Flow

Once you update your keys:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Go to Fund Wallet page**: `http://localhost:3001/fund-wallet`

3. **Enter an amount and click "Fund Wallet"**

4. **You'll be redirected to real Flutterwave payment page**

5. **Use Flutterwave Test Cards**:
   - **Successful Card**: `4187427415564246`
   - **CVV**: `828`
   - **Expiry**: `09/32`
   - **PIN**: `3310`
   - **OTP**: `12345`

6. **After successful payment, you'll be redirected back and your wallet will be credited**

## Step 4: Verify Payment

- Check your dashboard to see the updated wallet balance
- Check wallet transactions to see the payment record
- All payments will go through real Flutterwave test environment

## Test Cards for Different Scenarios

### Successful Payment
- **Card**: `4187427415564246`
- **CVV**: `828`
- **Expiry**: `09/32`
- **PIN**: `3310`
- **OTP**: `12345`

### Failed Payment (for testing failures)
- **Card**: `4187427415564246`
- **CVV**: `828` 
- **Expiry**: `09/32`
- **PIN**: `3310`
- **OTP**: `54321`

## Notes

- Test mode uses Flutterwave's sandbox environment
- No real money is charged in test mode
- All test transactions are recorded but not processed as real payments
- You can view all test transactions in your Flutterwave dashboard

## Production Deployment

When ready for production:
1. Replace test keys with live keys
2. Change `FLUTTERWAVE_ENVIRONMENT=live`
3. Deploy your application

Your payment system is now ready for real Flutterwave test payments!
