import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Calendar, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const MyThrifts = () => {
  const [activeTab, setActiveTab] = useState('active');

  // Mock data - replace with actual API calls
  const thriftAccounts = [
    {
      id: 1,
      planName: '1 Account Standard',
      dailyAmount: 1000,
      registrationFee: 5000,
      startDate: '2024-01-15',
      maturityDate: '2025-01-15',
      status: 'active',
      currentWeek: 12,
      totalWeeks: 52,
      amountSaved: 85000,
      targetAmount: 365000,
      settlementAmount: 500000,
      lastContribution: '2024-12-30',
      defaults: 2
    },
    {
      id: 2,
      planName: 'Medium Plan',
      dailyAmount: 500,
      registrationFee: 5000,
      startDate: '2024-03-01',
      maturityDate: '2025-03-01',
      status: 'active',
      currentWeek: 8,
      totalWeeks: 52,
      amountSaved: 28000,
      targetAmount: 182500,
      settlementAmount: 250000,
      lastContribution: '2024-12-30',
      defaults: 0
    },
    {
      id: 3,
      planName: '2 Accounts Standard',
      dailyAmount: 2000,
      registrationFee: 10000,
      startDate: '2023-06-01',
      maturityDate: '2024-06-01',
      status: 'matured',
      currentWeek: 52,
      totalWeeks: 52,
      amountSaved: 730000,
      targetAmount: 730000,
      settlementAmount: 1000000,
      lastContribution: '2024-05-31',
      defaults: 1
    }
  ];

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'matured':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4" />;
      case 'matured':
        return <CheckCircle className="h-4 w-4" />;
      case 'paused':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredAccounts = thriftAccounts.filter(account => {
    if (activeTab === 'active') return account.status === 'active';
    if (activeTab === 'matured') return account.status === 'matured';
    if (activeTab === 'all') return true;
    return false;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">My Thrift Accounts</h1>
          <p className="text-green-100">
            Monitor your savings progress and track your contributions across all accounts.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Accounts</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {thriftAccounts.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Saved</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(thriftAccounts.reduce((sum, acc) => sum + acc.amountSaved, 0))}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Expected Settlement</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(thriftAccounts.filter(a => a.status === 'active').reduce((sum, acc) => sum + acc.settlementAmount, 0))}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'active', name: 'Active Accounts' },
                { id: 'matured', name: 'Matured Accounts' },
                { id: 'all', name: 'All Accounts' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAccounts.map((account) => (
                <div key={account.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  {/* Account Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{account.planName}</h3>
                      <p className="text-sm text-gray-500">
                        Daily: {formatCurrency(account.dailyAmount)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                        {getStatusIcon(account.status)}
                        <span className="ml-1 capitalize">{account.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Progress</span>
                      <span className="text-sm text-gray-500">
                        Week {account.currentWeek} of {account.totalWeeks}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress(account.amountSaved, account.targetAmount)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(account.amountSaved)}</span>
                      <span>{formatCurrency(account.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(account.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Maturity Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(account.maturityDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Last Contribution</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(account.lastContribution)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Defaults</p>
                      <p className="text-sm font-medium text-gray-900">
                        {account.defaults} {account.defaults > 0 && '⚠️'}
                      </p>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount Saved:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(account.amountSaved)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target Amount:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(account.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-green-600 font-medium">Settlement Amount:</span>
                      <span className="font-bold text-green-600">{formatCurrency(account.settlementAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Profit:</span>
                      <span>{formatCurrency(account.settlementAmount - account.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200">
                      View Details
                    </button>
                    {account.status === 'active' && (
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                        Pause Account
                      </button>
                    )}
                    {account.status === 'matured' && (
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                        Claim Settlement
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
                <p className="text-gray-500">
                  {activeTab === 'active' && 'You don\'t have any active thrift accounts.'}
                  {activeTab === 'matured' && 'You don\'t have any matured accounts yet.'}
                  {activeTab === 'all' && 'Start your savings journey by creating your first thrift account.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyThrifts;