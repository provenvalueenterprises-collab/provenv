import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { nhost } from '../../../lib/nhost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    return handleFundWallet(req, res, session.user.id);
  } else if (req.method === 'GET') {
    return handleGetTransactions(req, res, session.user.id);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleFundWallet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { amount, paymentMethod, reference } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    // In a real implementation, you would verify the payment with your payment provider
    // For now, we'll assume the payment is successful
    
    // Update user wallet balance
    const { data, error } = await nhost.graphql.request(`
      mutation FundWallet($userId: uuid!, $amount: numeric!, $reference: String!) {
        update_user_profiles(
          where: {user_id: {_eq: $userId}}
          _inc: {wallet_balance: $amount}
        ) {
          returning {
            wallet_balance
          }
        }
        
        insert_wallet_transactions_one(object: {
          user_id: $userId
          type: "credit"
          amount: $amount
          description: "Wallet funding"
          reference: $reference
          status: "completed"
          payment_method: $paymentMethod
          created_at: "now()"
        }) {
          id
        }
      }
    `, {
      userId,
      amount: parseFloat(amount),
      reference
    });

    if (error) {
      console.error('Error funding wallet:', error);
      return res.status(500).json({ message: 'Failed to fund wallet' });
    }

    res.status(200).json({
      message: 'Wallet funded successfully',
      newBalance: data.update_user_profiles.returning[0].wallet_balance,
      transactionId: data.insert_wallet_transactions_one.id
    });

  } catch (error) {
    console.error('Wallet funding error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetTransactions(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { data, error } = await nhost.graphql.request(`
      query GetWalletTransactions($userId: uuid!) {
        wallet_transactions(
          where: {user_id: {_eq: $userId}}
          order_by: {created_at: desc}
          limit: 50
        ) {
          id
          type
          amount
          description
          reference
          status
          payment_method
          created_at
        }
      }
    `, { userId });

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ message: 'Failed to fetch transactions' });
    }

    res.status(200).json({ transactions: data.wallet_transactions });

  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
