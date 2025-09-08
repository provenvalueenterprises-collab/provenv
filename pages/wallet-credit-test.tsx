// pages/wallet-credit-test.tsx - Simple test page to credit wallet with any amount
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export default function WalletCreditTest() {
  const { data: session } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; newBalance?: number } | null>(null);

  const handleCreditWallet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setResult({ success: false, message: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/wallet/test-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          newBalance: data.newBalance
        });
        setAmount(''); // Clear amount after successful credit
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to credit wallet'
        });
      }
    } catch (error) {
      console.error('❌ Error crediting wallet:', error);
      setResult({
        success: false,
        message: 'Network error. Please try again.'
      });
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
            <Link href="/dashboard">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="text-center mb-6">
          <Plus className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Wallet Credit</h1>
          <p className="text-gray-600">Add any amount to your wallet for testing</p>
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-3">
            Development Mode Only
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Credit (₦)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (e.g., 5000)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            step="1"
          />
        </div>

        {/* Credit Button */}
        <button
          onClick={handleCreditWallet}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
        >
          {loading ? '⏳ Processing...' : `💳 Credit ₦${amount ? parseFloat(amount).toLocaleString() : '0'}`}
        </button>

        {/* Result Display */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </p>
                {result.success && result.newBalance && (
                  <p className="text-sm text-green-600 mt-1">
                    New wallet balance: ₦{result.newBalance.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Quick amounts:</p>
          <div className="grid grid-cols-3 gap-2">
            {[1000, 5000, 10000].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                ₦{quickAmount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Information */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Test Environment</p>
            <p>This endpoint only works in development mode. The credited amount will be immediately added to your wallet balance and a transaction record will be created.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
