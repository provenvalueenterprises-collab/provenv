// pages/api/payments/initiate-simple.ts
import { NextApiRequest, NextApiResponse } from 'next';

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
      description,
      customerEmail = 'testuser@provenvalue.com',
      customerName = 'Test User'
    } = req.body;

    // Generate unique payment reference
    const paymentReference = `SIMPLE_${Date.now()}_${paymentType}`;

    console.log('🧪 Simple payment endpoint called with:', {
      amount,
      paymentType,
      customerEmail,
      customerName,
      paymentReference
    });

    // Direct Flutterwave API call
    const payload = {
      tx_ref: paymentReference,
      amount: parseFloat(amount),
      currency: 'NGN',
      redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/payment/success?ref=${paymentReference}`,
      customer: {
        email: customerEmail,
        name: customerName,
      },
      customizations: {
        title: 'ProvenValue Payment',
        description: description || `Payment for ${paymentType}`,
      },
      payment_options: 'card,banktransfer,ussd',
    };

    console.log('💳 Calling Flutterwave directly with payload:', payload);

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    console.log('📡 Direct API response:', result);

    if (result.status === 'success') {
      return res.status(200).json({
        success: true,
        data: {
          link: result.data.link,
          id: result.data.id || 'hosted-payment',
          tx_ref: result.data.tx_ref || paymentReference,
        },
        message: 'Payment initialized successfully',
      });
    } else {
      console.error('❌ Flutterwave API error:', result);
      return res.status(400).json({
        success: false,
        message: result.message || 'Payment initialization failed',
        error: result
      });
    }

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
