import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Wallet
} from 'lucide-react';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Define user from session
  const user = session.user;

  const stats = [
    {
      title: "Total Savings",
      value: "₦125,340",
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign
    },
    {
      title: "Active Thrifts",
      value: "3",
      change: "+1",
      changeType: "positive", 
      icon: Target
    },
    {
      title: "Referrals",
      value: "8",
      change: "+2",
      changeType: "positive",
      icon: Users
    },
    {
      title: "Monthly Growth",
      value: "15.8%",
      change: "+3.2%",
      changeType: "positive",
      icon: TrendingUp
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "deposit",
      description: "Daily Thrift Contribution",
      amount: "+₦1,000",
      date: "2025-08-26",
      status: "completed"
    },
    {
      id: 2,
      type: "withdrawal", 
      description: "Thrift Maturity Payout",
      amount: "+₦45,000",
      date: "2025-08-25",
      status: "completed"
    },
    {
      id: 3,
      type: "deposit",
      description: "Referral Bonus",
      amount: "+₦5,000", 
      date: "2025-08-24",
      status: "completed"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/fund-wallet">
                <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-lg hover:from-primary-700 hover:to-secondary-700">
                  Fund Wallet
                </button>
              </Link>
              <Link href="/profile">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {session?.user?.email?.[0]?.toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="bg-gradient-to-r from-primary-100 to-secondary-100 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-gray-500 text-sm ml-2">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <Link href="/transactions">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View All
                    </button>
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/thrifts">
                  <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-colors">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-primary-600 mr-3" />
                      <span className="font-medium text-gray-900">My Thrifts</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </button>
                </Link>
                
                <Link href="/fund-wallet">
                  <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-colors">
                    <div className="flex items-center">
                      <Wallet className="h-5 w-5 text-primary-600 mr-3" />
                      <span className="font-medium text-gray-900">Fund Wallet</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </button>
                </Link>

                <Link href="/referrals">
                  <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-colors">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-primary-600 mr-3" />
                      <span className="font-medium text-gray-900">Refer Friends</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Current Thrift */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Active Thrift</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Standard Thrift</span>
                  <span className="font-semibold">₦45,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Days Remaining</span>
                  <span className="font-semibold">23 days</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-white/80">65% completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
