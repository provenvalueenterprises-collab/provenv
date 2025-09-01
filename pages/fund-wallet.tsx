// pages/fund-wallet.tsx - Example usage of PaymentForm
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import PaymentForm from '../components/PaymentForm';

export default function FundWallet() {
  const { data: session } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState<number>(1000);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment initiated successfully:', data);
    setPaymentSuccess(true);
    setPaymentError('');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p>You need to be logged in to fund your wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
        <h1 className="text-2xl font-bold text-center mb-6">Fund Your Wallet</h1>

        {paymentSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Payment initiated successfully! You will be redirected to complete the payment.
          </div>
        )}

        {paymentError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {paymentError}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₦)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="100"
            max="100000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter amount"
          />
          <p className="text-sm text-gray-500 mt-1">Minimum: ₦100, Maximum: ₦100,000</p>
        </div>

        <PaymentForm
          amount={amount}
          paymentType="wallet_topup"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Secure payments powered by Monnify
          </p>
        </div>
      </div>
    </div>
  );
}
