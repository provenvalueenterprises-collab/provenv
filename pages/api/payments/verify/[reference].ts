// pages/api/payments/verify/[reference].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { monnifyService } from '../../../../lib/monnify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    // Verify payment with Monnify
    const verification = await monnifyService.verifyPayment(reference);

    if (verification.requestSuccessful) {
      const paymentData = verification.responseBody;

      // Check if payment was successful
      const isSuccessful = paymentData.paymentStatus === 'PAID';

      res.status(200).json({
        success: true,
        verified: isSuccessful,
        paymentData: {
          reference: paymentData.paymentReference,
          amount: paymentData.amount,
          status: paymentData.paymentStatus,
          customer: paymentData.customer,
        },
      });
    } else {
      res.status(200).json({
        success: false,
        verified: false,
        message: verification.responseMessage,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Failed to verify payment',
    });
  }
}
