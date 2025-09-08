// pages/fund-wallet.tsx - Unified Fund Wallet page using VirtualAccountCard
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import VirtualAccountCard from '../components/VirtualAccountCard';
import ProtectedRoute from '../components/ProtectedRoute';

export default function FundWallet() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/api/auth/signout');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard">
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </button>
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {session?.user?.name || session?.user?.email}
                </span>
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
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fund Your Wallet</h1>
            <p className="text-gray-600">
              Add money to your ProVenv investment wallet using your virtual account or card payment
            </p>
          </div>

          {/* Virtual Account Card - This includes both virtual account details and card funding */}
          <div className="max-w-2xl mx-auto">
            <VirtualAccountCard />
          </div>

          {/* Additional Information */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 How to Fund Your Wallet</h3>
              <div className="space-y-3 text-blue-800">
                <div className="flex items-start">
                  <span className="font-semibold mr-2">🏦 Bank Transfer:</span>
                  <span>Use your virtual account number to transfer money from any bank. Your wallet will be credited automatically.</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">💳 Card Payment:</span>
                  <span>Use the "Fund with Card" button for instant funding with your debit/credit card via Flutterwave.</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">⚡ Processing Time:</span>
                  <span>Bank transfers: 5-10 minutes | Card payments: Instant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="max-w-2xl mx-auto mt-6 text-center">
            <p className="text-sm text-gray-500">
              🔒 Your payments are secured with bank-level encryption and processed by licensed financial institutions
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
