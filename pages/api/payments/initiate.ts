// pages/api/payments/initiate.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { monnifyService } from '../../../lib/monnify';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      amount,
      paymentType, // 'thrift_contribution', 'wallet_topup', etc.
      thriftPlanId,
      description,
    } = req.body;

    // Generate unique payment reference
    const paymentReference = `PV_${Date.now()}_${session.user.id}_${paymentType}`;

    // Initialize payment with Monnify
    const paymentData = {
      amount: parseFloat(amount),
      customerName: session.user.name || session.user.email,
      customerEmail: session.user.email,
      paymentReference,
      paymentDescription: description || `Payment for ${paymentType}`,
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE!,
      redirectUrl: `${process.env.NEXTAUTH_URL}/payment/success?ref=${paymentReference}`,
      paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
    };

    const response = await monnifyService.initializePayment(paymentData);

    if (response.requestSuccessful) {
      // Store payment record in database (you'll need to implement this)
      // await storePaymentRecord({
      //   userId: session.user.id,
      //   reference: paymentReference,
      //   amount,
      //   type: paymentType,
      //   thriftPlanId,
      //   status: 'pending'
      // });

      res.status(200).json({
        success: true,
        checkoutUrl: response.responseBody.checkoutUrl,
        paymentReference: response.responseBody.paymentReference,
      });
    } else {
      res.status(400).json({
        success: false,
        message: response.responseMessage,
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
    });
  }
}
