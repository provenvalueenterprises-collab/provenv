// pages/api/payments/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { monnifyService } from '../../../lib/monnify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      eventType,
      eventData: {
        paymentReference,
        amountPaid,
        totalPayable,
        paymentStatus,
        customer: { email },
      },
    } = req.body;

    console.log('Monnify webhook received:', {
      eventType,
      paymentReference,
      paymentStatus,
      amountPaid,
    });

    // Verify the webhook is from Monnify (you should implement signature verification)
    // const isValidSignature = verifyWebhookSignature(req.headers, req.body);

    if (eventType === 'SUCCESSFUL_TRANSACTION') {
      // Verify payment with Monnify
      const verification = await monnifyService.verifyPayment(paymentReference);

      if (verification.requestSuccessful &&
          verification.responseBody.paymentStatus === 'PAID') {

        // Update payment status in database
        // await updatePaymentStatus(paymentReference, 'completed', amountPaid);

        // Process the payment based on type
        // await processPayment(paymentReference);

        console.log('Payment processed successfully:', paymentReference);
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ status: 'error' });
  }
}
