import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Settlement {
  id: string;
  planName: string;
  accountNumber: string;
  contributionAmount: number;
  penaltyAmount: number;
  totalOwed: number;
  defaultDate: string;
  daysMissed: number;
}

interface SettlementData {
  currentWalletBalance: number;
  summary: {
    totalPendingSettlements: number;
    totalPendingAmount: number;
    totalContributionsOwed: number;
    totalPenaltiesOwed: number;
    completedSettlements: number;
    canSettle: boolean;
  };
  pendingSettlements: Settlement[];
  completedSettlements: Settlement[];
}

const PendingSettlementsWidget = () => {
  const [settlementData, setSettlementData] = useState<SettlementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settlements/pending');
      const result = await response.json();

      if (result.success) {
        setSettlementData(result.data);
      } else {
        setError(result.error || 'Failed to fetch settlements');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Settlement fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processSettlements = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/settlements/process', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        // Refresh data after processing
        await fetchSettlements();
        alert('Settlements processed successfully!');
      } else {
        alert(`Settlement processing failed: ${result.message}`);
      }
    } catch (err) {
      alert('Network error during settlement processing');
      console.error('Settlement process error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!settlementData) return null;

  const { summary, pendingSettlements, currentWalletBalance } = settlementData;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pending Settlements</h3>
          {summary.totalPendingSettlements > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {summary.totalPendingSettlements} pending
            </span>
          )}
        </div>

        {summary.totalPendingSettlements === 0 ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>All contributions are up to date!</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="font-semibold text-red-600">₦{summary.totalPendingAmount.toLocaleString()}</div>
                <div className="text-red-500">Total Owed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-600">₦{summary.totalContributionsOwed.toLocaleString()}</div>
                <div className="text-blue-500">Contributions</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="font-semibold text-orange-600">₦{summary.totalPenaltiesOwed.toLocaleString()}</div>
                <div className="text-orange-500">Penalties</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-600">₦{currentWalletBalance.toLocaleString()}</div>
                <div className="text-gray-500">Wallet Balance</div>
              </div>
            </div>

            {/* Settlement Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {summary.canSettle ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                )}
                <span className="font-medium">
                  {summary.canSettle 
                    ? 'Sufficient balance to settle all defaults' 
                    : `Need ₦${(summary.totalPendingAmount - currentWalletBalance).toLocaleString()} more to settle all defaults`
                  }
                </span>
              </div>
              {summary.canSettle && (
                <button
                  onClick={processSettlements}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Settle Now'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pending Settlements List */}
      {pendingSettlements.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Default Details</h4>
          <div className="space-y-3">
            {pendingSettlements.map((settlement) => (
              <div key={settlement.id} className="border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="font-medium">{settlement.planName}</span>
                    <span className="text-sm text-gray-500 ml-2">({settlement.accountNumber})</span>
                  </div>
                  <span className="text-sm text-red-600 font-medium">
                    ₦{settlement.totalOwed.toLocaleString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Contribution:</span> ₦{settlement.contributionAmount.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Penalty (100%):</span> ₦{settlement.penaltyAmount.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Default Date:</span> {new Date(settlement.defaultDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Days Missed:</span> {settlement.daysMissed}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingSettlementsWidget;
