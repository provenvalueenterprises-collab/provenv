import React, { useState } from 'react';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import {
  Users,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Search,
  Mail,
  Edit,
  Eye,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data - replace with actual API calls
  const adminData = {
    totalUsers: 2850,
    totalWalletBalance: 15750000,
    totalContributions: 45000000,
    pendingComplaints: 12,
    activeAccounts: 5200,
    settledAccounts: 1200,
    totalReferrals: 890,
    monthlyGrowth: 18.5
  };

  const recentUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '08012345678',
      walletBalance: 45000,
      status: 'active',
      joinDate: '2024-12-25'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '08087654321',
      walletBalance: 78000,
      status: 'active',
      joinDate: '2024-12-24'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '08056789012',
      walletBalance: 12000,
      status: 'inactive',
      joinDate: '2024-12-23'
    }
  ];

  const recentComplaints = [
    {
      id: 1,
      user: 'Sarah Wilson',
      subject: 'Payment not credited',
      message: 'I made a transfer but my wallet was not credited',
      status: 'pending',
      date: '2024-12-29'
    },
    {
      id: 2,
      user: 'David Brown',
      subject: 'Wrong deduction amount',
      message: 'System deducted more than my daily contribution',
      status: 'resolved',
      date: '2024-12-28'
    }
  ];

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = recentUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-purple-100">
            Manage users, monitor transactions, and oversee platform operations.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Users"
            value={adminData.totalUsers}
            icon={Users}
            color="blue"
            trend={adminData.monthlyGrowth}
          />
          
          <DashboardCard
            title="Total Wallet Balance"
            value={formatCurrency(adminData.totalWalletBalance)}
            icon={Wallet}
            color="green"
            trend={12.3}
          />
          
          <DashboardCard
            title="Total Contributions"
            value={formatCurrency(adminData.totalContributions)}
            icon={TrendingUp}
            color="purple"
            trend={8.7}
          />
          
          <DashboardCard
            title="Pending Complaints"
            value={adminData.pendingComplaints}
            icon={AlertTriangle}
            color="orange"
            trend={-15.2}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Active Accounts"
            value={adminData.activeAccounts}
            icon={CheckCircle}
            color="green"
            subtitle="Currently saving"
          />
          
          <DashboardCard
            title="Settled Accounts"
            value={adminData.settledAccounts}
            icon={TrendingUp}
            color="blue"
            subtitle="Completed cycles"
          />
          
          <DashboardCard
            title="Total Referrals"
            value={adminData.totalReferrals}
            icon={Users}
            color="indigo"
            subtitle="This month"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'users', name: 'Users Management' },
                { id: 'complaints', name: 'Complaints' },
                { id: 'transactions', name: 'Transactions' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    selectedTab === tab.id
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
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">New registrations today</span>
                        <span className="font-medium">24</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Wallet transactions</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Daily contributions</span>
                        <span className="font-medium">2,340</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">System Health</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment gateway</span>
                        <span className="text-green-600 font-medium">Operational</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Database</span>
                        <span className="text-green-600 font-medium">Healthy</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Auto-deductions</span>
                        <span className="text-green-600 font-medium">Running</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wallet Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">Joined {formatDate(user.joinDate)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{user.email}</div>
                            <div>{user.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(user.walletBalance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-indigo-600 hover:text-indigo-900">
                                <Mail className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'complaints' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Complaints Management</h3>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                    Send Bulk Email
                  </button>
                </div>

                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <div key={complaint.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{complaint.subject}</h4>
                          <p className="text-sm text-gray-600">From: {complaint.user}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            complaint.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {complaint.status}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(complaint.date)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{complaint.message}</p>
                      <div className="flex space-x-3">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors duration-200">
                          Respond
                        </button>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200">
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'transactions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Transaction Monitoring</h3>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">Transaction monitoring interface would be implemented here.</p>
                  <p className="text-sm text-gray-500 mt-2">Real-time transaction logs, payment gateway status, and financial reports.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;