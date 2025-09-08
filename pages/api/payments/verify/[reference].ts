// pages/api/payments/verify/[reference].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]'
import { Client } from 'pg'

// Flutterwave verification function
async function verifyFlutterwavePayment(reference: string, req?: NextApiRequest) {
  try {
    // Check if we have real Flutterwave keys (test or live) vs placeholder keys
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    const hasRealKeys = secretKey?.startsWith('FLWSECK_TEST-') || 
                       secretKey?.startsWith('FLWSECK-') ||
                       (!secretKey?.includes('SANDBOXDEMOKEY') && !secretKey?.includes('DEVELOPMENT'));

    if (!hasRealKeys && reference.includes('PV_')) {
      console.log('🧪 Development mode - creating mock verification response for:', reference);
      
      // Default amount if we can't extract from reference
      let amount = 1000; 
      
      // Try to get amount from request query parameters first
      if (req?.query.amount) {
        amount = parseFloat(req.query.amount as string);
        console.log('📊 Using amount from query:', amount);
      } else {
        // Try to extract amount from cookies or session storage
        // Since this is verification, the amount might be passed as a query param
        console.log('⚠️ No amount provided, using default:', amount);
      }
      
      // Return mock successful verification
      return {
        status: 'success',
        message: 'Mock verification successful',
        data: {
          id: `mock_txn_${Date.now()}`,
          tx_ref: reference,
          flw_ref: `FLW_MOCK_${Date.now()}`,
          amount: amount,
          currency: 'NGN',
          status: 'successful',
          payment_type: 'card',
          created_at: new Date().toISOString(),
          customer: {
            email: 'test@example.com',
            name: 'Test User'
          }
        }
      };
    }

    // Real Flutterwave verification for test or production
    console.log('🔍 Verifying payment with Flutterwave API:', reference);
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('📡 Flutterwave verification response:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Flutterwave verification error:', error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    console.log('🔍 Payment verification request received:', {
      reference,
      method: req.method,
      query: req.query,
      headers: {
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer
      }
    });

    if (!reference || typeof reference !== 'string') {
      console.log('❌ Invalid reference provided:', reference);
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    console.log('🔐 Session check result:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      sessionData: session ? {
        email: session.user?.email,
        name: session.user?.name
      } : null
    });

    if (!session?.user?.email) {
      console.log('❌ Unauthorized - no session or email');
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('🔍 Verifying payment:', reference, 'for user:', session.user.email)

    // Verify payment with Flutterwave
    const verification = await verifyFlutterwavePayment(reference, req);

    console.log('📡 Flutterwave verification result:', {
      status: verification.status,
      success: verification.status === 'success',
      paymentStatus: verification.data?.status,
      amount: verification.data?.amount,
      reference: verification.data?.tx_ref
    });

    if (verification.status === 'success') {
      const paymentData = verification.data;

      // Check if payment was successful
      const isSuccessful = paymentData.status === 'successful';

      console.log('💳 Payment verification details:', {
        txRef: paymentData.tx_ref,
        amount: paymentData.amount,
        status: paymentData.status,
        isSuccessful,
        customer: paymentData.customer?.email
      });

      if (isSuccessful) {
        console.log('✅ Payment verified successfully, updating wallet...', {
          reference: paymentData.tx_ref,
          amount: paymentData.amount,
          customer: paymentData.customer?.email,
          userEmail: session.user.email
        })

        try {
          // Update wallet balance for successful payment
          await updateWalletBalance(session.user.email, paymentData.amount, reference)
          console.log('✅ Wallet balance updated successfully');
        } catch (walletError) {
          console.error('❌ Error updating wallet balance:', walletError);
          throw walletError;
        }
      } else {
        console.log('⚠️ Payment not successful, status:', paymentData.status);
      }

      console.log('📤 Sending verification response:', {
        success: true,
        verified: isSuccessful,
        paymentData: {
          reference: paymentData.tx_ref,
          amount: paymentData.amount,
          status: paymentData.status,
          customer: paymentData.customer,
        },
      });

      res.status(200).json({
        success: true,
        verified: isSuccessful,
        paymentData: {
          reference: paymentData.tx_ref,
          amount: paymentData.amount,
          status: paymentData.status,
          customer: paymentData.customer,
        },
      });
    } else {
      console.log('❌ Payment verification failed:', verification.message);
      res.status(200).json({
        success: false,
        verified: false,
        message: verification.message || 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
}

async function updateWalletBalance(userEmail: string, amount: number, reference: string) {
  console.log('💰 Starting wallet balance update:', {
    userEmail,
    amount,
    reference
  });

  try {
    // Create PostgreSQL client
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: false // Use same connection as working APIs
    })

    console.log('🔗 Connecting to database for wallet update...');
    await client.connect()
    console.log('✅ Database connected for wallet update');

    // Get user and current wallet balance
    const userQuery = `
      SELECT u.id, u.email, up.wallet_balance 
      FROM auth.users u 
      JOIN users_profiles up ON u.id = up.user_id 
      WHERE u.email = $1
    `
    console.log('👤 Fetching user data for:', userEmail);
    const userResult = await client.query(userQuery, [userEmail])

    if (userResult.rows.length === 0) {
      await client.end()
      console.error('❌ User not found for wallet update:', userEmail)
      throw new Error(`User not found: ${userEmail}`)
    }

    const user = userResult.rows[0]
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      currentBalance: user.wallet_balance
    });
    
    // Check if transaction already exists
    const existingTxQuery = `
      SELECT * FROM wallet_transactions 
      WHERE reference = $1 AND user_id = $2
    `
    console.log('🔍 Checking for existing transaction with reference:', reference);
    const existingTx = await client.query(existingTxQuery, [reference, user.id])

    if (existingTx.rows.length > 0) {
      await client.end()
      console.log('⚠️ Transaction already processed:', reference)
      return
    }

    const currentBalance = parseFloat(user.wallet_balance || 0)
    const newBalance = currentBalance + parseFloat(amount.toString())

    console.log('💰 Balance calculation:', {
      currentBalance,
      amount: parseFloat(amount.toString()),
      newBalance
    });

    // Start transaction
    console.log('🔄 Starting database transaction...');
    await client.query('BEGIN')

    try {
      // Update wallet balance
      const updateQuery = `
        UPDATE users_profiles 
        SET 
          wallet_balance = $1,
          updated_at = NOW()
        WHERE user_id = $2
        RETURNING wallet_balance
      `
      
      console.log('💳 Updating wallet balance...', {
        newBalance,
        userId: user.id
      });
      const updateResult = await client.query(updateQuery, [newBalance, user.id])
      console.log('✅ Wallet balance updated, returned:', updateResult.rows[0]);

      // Log transaction
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_id, 
          transaction_type,
          type, 
          amount, 
          balance_before,
          balance_after,
          reference, 
          status, 
          description,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `
      
      console.log('📝 Creating transaction record...');
      const txResult = await client.query(transactionQuery, [
        user.id,
        'CREDIT',
        'credit',
        amount,
        currentBalance,
        newBalance,
        reference,
        'completed',
        'Wallet funding via payment verification'
      ])

      console.log('✅ Transaction record created:', txResult.rows[0]);

      // Commit transaction
      console.log('✅ Committing database transaction...');
      await client.query('COMMIT')

      console.log(`✅ Wallet updated via verification: ${user.email} +₦${amount} (New balance: ₦${newBalance})`)

    } catch (error) {
      // Rollback transaction
      console.log('❌ Error in transaction, rolling back...');
      await client.query('ROLLBACK')
      throw error
    }

    await client.end()
    console.log('👋 Database connection closed after wallet update');

  } catch (error) {
    console.error('❌ Wallet update error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error; // Re-throw to let caller handle
  }
}
