import React from 'react';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../contexts/AuthContext';
import {
  Wallet,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Users,
  Gift,
  CheckCircle,
  Clock
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();

  // Mock data - replace with actual API calls
  const dashboardData = {
    walletBalance: 125000,
    activationDate: '2024-01-15',
    maturityDate: '2025-01-15',
    currentBalance: 85000,
    currentWeek: 12,
    ledgerBalance: 110000,
    totalDefaults: 2,
    defaultWeek: 8,
    totalThriftAccounts: 3,
    totalReferrals: 8,
    pendingSettlements: 1,
    totalPaidAccounts: 2,
    referralsWithin60Days: 5,
    bonusWallet: 40000
  };

  const recentTransactions = [
    {
      id: 1,
      type: 'contribution',
      amount: -1000,
      description: 'Daily contribution - Account 1',
      date: '2024-12-30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'deposit',
      amount: 50000,
      description: 'Wallet funding via bank transfer',
      date: '2024-12-29',
      status: 'completed'
    },
    {
      id: 3,
      type: 'fine',
      amount: -1000,
      description: 'Insufficient balance fine',
      date: '2024-12-28',
      status: 'completed'
    }
  ];

  const formatCurrency = (amount: number) => {
    return `₦${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-green-100">
            Track your savings progress and manage your contributions below.
          </p>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Wallet Balance"
            value={formatCurrency(dashboardData.walletBalance)}
            icon={Wallet}
            color="green"
            trend={12.5}
          />
          
          <DashboardCard
            title="Current Balance"
            value={formatCurrency(dashboardData.currentBalance)}
            icon={TrendingUp}
            color="blue"
            subtitle={`Week ${dashboardData.currentWeek} of 52`}
          />
          
          <DashboardCard
            title="Total Referrals"
            value={dashboardData.totalReferrals}
            icon={Users}
            color="purple"
            trend={25}
          />
          
          <DashboardCard
            title="Bonus Wallet"
            value={formatCurrency(dashboardData.bonusWallet)}
            icon={Gift}
            color="orange"
            trend={15}
          />
        </div>

        {/* Secondary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Activation Date"
            value={formatDate(dashboardData.activationDate)}
            icon={Calendar}
            color="indigo"
          />
          
          <DashboardCard
            title="Maturity Date"
            value={formatDate(dashboardData.maturityDate)}
            icon={Calendar}
            color="blue"
          />
          
          <DashboardCard
            title="Ledger Balance"
            value={formatCurrency(dashboardData.ledgerBalance)}
            icon={CheckCircle}
            color="green"
          />
          
          <DashboardCard
            title="Total Defaults"
            value={dashboardData.totalDefaults}
            icon={AlertTriangle}
            color="red"
            subtitle={`Last default: Week ${dashboardData.defaultWeek}`}
          />
        </div>

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Thrift Accounts"
            value={dashboardData.totalThriftAccounts}
            icon={TrendingUp}
            color="green"
            subtitle="Active accounts"
          />
          
          <DashboardCard
            title="Pending Settlements"
            value={dashboardData.pendingSettlements}
            icon={Clock}
            color="orange"
            subtitle="Ready for payout"
          />
          
          <DashboardCard
            title="Paid Accounts"
            value={dashboardData.totalPaidAccounts}
            icon={CheckCircle}
            color="green"
            subtitle="Completed successfully"
          />
          
          <DashboardCard
            title="Recent Referrals"
            value={dashboardData.referralsWithin60Days}
            icon={Users}
            color="blue"
            subtitle="Within 60 days"
          />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-100' :
                      transaction.type === 'contribution' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <TrendingUp className={`h-5 w-5 ${
                          transaction.type === 'deposit' ? 'text-green-600' :
                          transaction.type === 'contribution' ? 'text-blue-600' : 'text-red-600'
                        }`} />
                      ) : transaction.type === 'contribution' ? (
                        <Wallet className="h-5 w-5 text-blue-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;