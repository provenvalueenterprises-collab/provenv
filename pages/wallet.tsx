// pages/wallet.tsx - Main wallet page with balance and navigation
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Plus, Clock, Eye, Wallet as WalletIcon } from 'lucide-react';

interface WalletData {
  balance: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  transaction_type: 'CREDIT' | 'DEBIT';
  type: 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  payment_method?: string;
  external_reference?: string;
  created_at: string;
  updated_at: string;
}

export default function Wallet() {
  const { data: session } = useSession();
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (session) {
      fetchWalletData();
    }
  }, [session]);

  const fetchWalletData = async () => {
    try {
      // Fetch wallet balance
      const balanceRes = await fetch('/api/wallet/balance');
      if (!balanceRes.ok) throw new Error('Failed to fetch balance');
      const balanceData = await balanceRes.json();

      // Fetch recent transactions (last 5)
      const transactionsRes = await fetch('/api/wallet/transactions?limit=5');
      if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');
      const transactionsData = await transactionsRes.json();

      setWalletData({
        balance: balanceData.balance || 0,
        recentTransactions: transactionsData.transactions || []
      });
    } catch (err) {
      setError('Failed to load wallet data');
      console.error('Wallet data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p>You need to be logged in to access your wallet.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading wallet...</p>
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
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            </Link>
            <h1 className="text-xl font-semibold">My Wallet</h1>
            <div className="w-5"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <WalletIcon className="w-6 h-6 mr-2" />
              <span className="text-blue-100">Wallet Balance</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">
            {formatCurrency(walletData?.balance || 0)}
          </div>
          <p className="text-blue-100 text-sm">
            Available for transactions
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/fund-wallet">
            <button className="flex flex-col items-center justify-center bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Fund Wallet</span>
            </button>
          </Link>

          <Link href="/wallet-transactions">
            <button className="flex flex-col items-center justify-center bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Transactions</span>
            </button>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <Link href="/wallet-transactions">
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View All
                </button>
              </Link>
            </div>
          </div>

          <div className="divide-y">
            {walletData?.recentTransactions && walletData.recentTransactions.length > 0 ? (
              walletData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          transaction.transaction_type === 'CREDIT' 
                            ? 'bg-green-100' 
                            : 'bg-red-100'
                        }`}>
                          {transaction.transaction_type === 'CREDIT' ? (
                            <Plus className={`w-5 h-5 text-green-600`} />
                          ) : (
                            <ArrowLeft className={`w-5 h-5 text-red-600`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description || 'Wallet Transaction'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        transaction.transaction_type === 'CREDIT' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'CREDIT' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent transactions</p>
                <Link href="/fund-wallet">
                  <button className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-700">
                    Fund your wallet to get started
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
