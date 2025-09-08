// pages/wallet-test.tsx - Test page for simulating successful payments in development
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function WalletTest() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Get query parameters
  const { amount, ref, email } = router.query;

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  const simulateSuccessfulPayment = async () => {
    if (!ref || !amount) {
      setResult({ success: false, message: 'Missing payment reference or amount' });
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Simulating successful payment...');
      
      // Call the simulation endpoint with the actual amount from URL
      const simulationResponse = await fetch('/api/payments/simulate-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount as string),
          reference: ref
        })
      });
      
      const result = await simulationResponse.json();
      console.log('✅ Simulation result:', result);
      
      if (result.success && result.verified) {
        setResult({ 
          success: true, 
          message: `Payment successful! ₦${parseFloat(amount as string).toLocaleString()} has been added to your wallet.` 
        });
      } else {
        setResult({ 
          success: false, 
          message: result.message || 'Payment simulation failed.' 
        });
      }
    } catch (error) {
      console.error('❌ Error simulating payment:', error);
      setResult({ success: false, message: 'Failed to process test payment' });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/fund-wallet">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Fund Wallet
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Payment Page</h1>
            <p className="text-gray-600">This is a test environment for development</p>
          </div>

          {amount && ref && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Payment Details</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Amount:</strong> ₦{parseFloat(amount as string).toLocaleString()}</p>
                <p><strong>Reference:</strong> {ref}</p>
                <p><strong>Email:</strong> {email}</p>
              </div>
            </div>
          )}

          {result ? (
            <div className={`p-4 rounded-lg mb-6 ${
              result.success 
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {result.message}
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Click the button below to simulate a successful payment and update your wallet balance.
              </p>
              
              <button
                onClick={simulateSuccessfulPayment}
                disabled={loading || !amount || !ref}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? '⏳ Processing...' : '✅ Simulate Successful Payment'}
              </button>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/dashboard">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                📊 Go to Dashboard
              </button>
            </Link>
            
            <Link href="/fund-wallet">
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                🔄 Try Another Payment
              </button>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🧪 Development Mode - This simulates a real payment for testing purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
