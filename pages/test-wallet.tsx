import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';

export default function TestWallet() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  const handleFundWallet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test/fund-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setAmount('');
        // Refresh wallet info after successful funding
        checkWallet();
      }
    } catch (error) {
      console.error('Error funding wallet:', error);
      setResult({ error: 'Failed to fund wallet' });
    } finally {
      setLoading(false);
    }
  };

  const checkWallet = async () => {
    try {
      const response = await fetch('/api/debug/wallet');
      const data = await response.json();
      setWalletInfo(data);
    } catch (error) {
      console.error('Error checking wallet:', error);
    }
  };

  const createProfile = async () => {
    try {
      const response = await fetch('/api/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setResult(data);
      if (data.success) {
        // Refresh wallet info after profile creation
        checkWallet();
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setResult({ error: 'Failed to create profile' });
    }
  };

  if (!session) {
    return (
      <Layout>
        <div className="p-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Please sign in to test wallet functionality
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🧪 Wallet Testing Interface</h1>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h2 className="font-semibold mb-2 text-blue-800">👤 Current User</h2>
            <p className="text-sm text-blue-600">
              <strong>Email:</strong> {session.user?.email}<br/>
              <strong>Name:</strong> {session.user?.name || 'Not set'}
            </p>
          </div>

          {/* Wallet Info */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <h2 className="font-semibold mb-3 text-gray-800">💰 Current Wallet Status</h2>
            <div className="flex gap-2 mb-3">
              <button 
                onClick={checkWallet}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                🔄 Check Wallet
              </button>
              <button 
                onClick={createProfile}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
              >
                🏗️ Create Profile
              </button>
            </div>
            {walletInfo && (
              <div className="bg-white p-3 rounded border">
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(walletInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Test Funding */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h2 className="font-semibold mb-3 text-green-800">💸 Test Manual Funding</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g., 100)"
                className="border border-gray-300 p-2 rounded flex-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleFundWallet}
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '⏳ Adding...' : '💰 Add Funds'}
              </button>
            </div>
            {result && (
              <div className={`p-3 rounded border ${result.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h2 className="font-semibold mb-3 text-yellow-800">📋 Testing Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
              <li><strong>Create Profile First:</strong> If you get "User profile not found", click "🏗️ Create Profile"</li>
              <li><strong>Check Current Status:</strong> Click "🔄 Check Wallet" to see your current balance and transaction history</li>
              <li><strong>Test Manual Funding:</strong> Enter an amount (like 100) and click "💰 Add Funds" to test database updates</li>
              <li><strong>Verify Update:</strong> Click "Check Wallet" again to confirm the balance increased</li>
              <li><strong>Compare with Card Payments:</strong> Try a card payment and see if it works the same way</li>
              <li><strong>Check Console:</strong> Open browser DevTools Console to see detailed logs</li>
            </ol>
          </div>

          {/* Quick Actions */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <h2 className="font-semibold mb-3 text-purple-800">⚡ Quick Test Actions</h2>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => {setAmount('100'); handleFundWallet();}}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
              >
                Add ₦100
              </button>
              <button 
                onClick={() => {setAmount('500'); handleFundWallet();}}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
              >
                Add ₦500
              </button>
              <button 
                onClick={() => {setAmount('1000'); handleFundWallet();}}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
              >
                Add ₦1000
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
