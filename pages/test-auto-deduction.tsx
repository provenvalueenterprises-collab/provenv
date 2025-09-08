import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import PendingSettlementsWidget from '../components/PendingSettlementsWidget';

const AutoDeductionTestPage = () => {
  const { data: session, status } = useSession();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const runDailyContributions = async () => {
    try {
      setProcessing(true);
      setError('');
      setResult(null);

      const response = await fetch('/api/cron/daily-contributions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer proven-value-cron-2025-secure-key`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to process daily contributions');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Daily contribution error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const fundWallet = async (amount: number) => {
    try {
      const response = await fetch('/api/test/fund-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Wallet funded with ₦${amount.toLocaleString()}! Settlements have been processed automatically.`);
        // Refresh the page to update the settlements widget
        window.location.reload();
      } else {
        alert(`Funding failed: ${data.message}`);
      }
    } catch (err) {
      alert('Network error during funding');
      console.error('Funding error:', err);
    }
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the auto-deduction test page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Auto-Deduction Test Panel</h1>
          <p className="text-gray-600">Test and monitor the automated daily contribution system</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="space-y-6">
            {/* Daily Contributions Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Contributions</h2>
              <p className="text-gray-600 mb-4">
                Manually trigger the daily contribution process to test auto-deduction and penalty system.
              </p>
              
              <button
                onClick={runDailyContributions}
                disabled={processing}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {processing ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Run Daily Contributions
                  </>
                )}
              </button>

              {result && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-medium text-green-800">Success!</span>
                  </div>
                  <p className="text-green-700 text-sm">{result.message}</p>
                  <p className="text-green-600 text-xs mt-1">Time: {result.timestamp}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-medium text-red-800">Error</span>
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Wallet Funding Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Wallet Funding</h2>
              <p className="text-gray-600 mb-4">
                Fund your wallet to test automatic settlement processing.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fundWallet(5000)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Fund ₦5,000
                </button>
                <button
                  onClick={() => fundWallet(10000)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Fund ₦10,000
                </button>
                <button
                  onClick={() => fundWallet(20000)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Fund ₦20,000
                </button>
                <button
                  onClick={() => fundWallet(50000)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Fund ₦50,000
                </button>
              </div>
            </div>

            {/* Information Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">How It Works</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• <strong>Daily Contributions:</strong> Automatically deducts daily amounts from active thrift accounts</li>
                <li>• <strong>Insufficient Balance:</strong> Creates a default with 100% penalty (contribution + penalty)</li>
                <li>• <strong>Auto Settlement:</strong> When wallet is funded, pending defaults are automatically settled</li>
                <li>• <strong>Contribution Recording:</strong> Only the contribution amount (not penalty) is added to savings</li>
                <li>• <strong>Transaction Logging:</strong> All activities are recorded for transparency</li>
              </ul>
            </div>
          </div>

          {/* Settlements Monitor */}
          <div>
            <PendingSettlementsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDeductionTestPage;
