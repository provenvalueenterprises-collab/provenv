// pages/api/payments/initiate-test.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { flutterwaveService } from '../../../lib/flutterwave';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      amount,
      paymentType = 'test_payment',
      thriftPlanId,
      description,
      customerEmail = 'testuser@provenvalue.com',
      customerName = 'Test User'
    } = req.body;

    // Generate unique payment reference
    const paymentReference = `TEST_${Date.now()}_${paymentType}`;

    console.log('🧪 Test payment endpoint called with:', {
      amount,
      paymentType,
      customerEmail,
      customerName,
      paymentReference
    });

    // Initialize payment with Flutterwave
    const paymentData = {
      amount: parseFloat(amount),
      customerName,
      customerEmail,
      paymentReference,
      paymentDescription: description || `Test payment for ${paymentType}`,
      redirectUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?ref=${paymentReference}`,
      currency: 'NGN',
    };

    console.log('💳 Calling Flutterwave with data:', paymentData);

    // Use the alternative method since the main one had import issues
    const result = await flutterwaveService.initializePaymentAlternative(paymentData);

    console.log('✅ Flutterwave result:', result);

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Payment initialized successfully',
    });

  } catch (error: any) {
    console.error('❌ Payment initialization error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message,
    });
  }
}
