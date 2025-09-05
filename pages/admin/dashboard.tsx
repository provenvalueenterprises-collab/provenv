import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import ProtectedRoute from '../../components/ProtectedRoute'

interface AdminDashboardData {
  user: {
    name: string
    email: string
    phone?: string
    role: string
  }
  stats: {
    totalUsers: number
    totalTransactions: number
    totalWalletBalance: number
    activeAccounts: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login')
      return
    }

    // Check if user is admin
    if (session.user?.role !== 'admin') {
      router.push('/dashboard') // Redirect non-admin users to regular dashboard
      return
    }

    const fetchAdminData = async () => {
      try {
        // For now, we'll use mock data since we don't have admin API endpoints yet
        setDashboardData({
          user: {
            name: session.user?.name || '',
            email: session.user?.email || '',
            role: session.user?.role || 'admin'
          },
          stats: {
            totalUsers: 0,
            totalTransactions: 0,
            totalWalletBalance: 0,
            activeAccounts: 0
          }
        })
      } catch (error) {
        console.error('Error fetching admin data:', error)
        setError('An error occurred while fetching admin data')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [session, status, router])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>🔄</div>
          <div style={{ fontSize: '18px' }}>Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Admin Dashboard</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Welcome back, {dashboardData?.user.name}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    User View
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData?.stats.totalUsers.toLocaleString() || '0'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transactions</h3>
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData?.stats.totalTransactions.toLocaleString() || '0'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Wallet Balance</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ₦{dashboardData?.stats.totalWalletBalance.toLocaleString() || '0'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Accounts</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {dashboardData?.stats.activeAccounts.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            {/* Admin Tools */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="font-semibold">Manage Users</div>
                    <div className="text-sm text-gray-600">View and manage user accounts</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/transactions')}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">💳</div>
                    <div className="font-semibold">Transactions</div>
                    <div className="text-sm text-gray-600">Monitor all transactions</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/reports')}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="font-semibold">Reports</div>
                    <div className="text-sm text-gray-600">Generate system reports</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/settings')}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚙️</div>
                    <div className="font-semibold">System Settings</div>
                    <div className="text-sm text-gray-600">Configure system settings</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/cleanup-orphaned-users')}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🧹</div>
                    <div className="font-semibold">Cleanup Tools</div>
                    <div className="text-sm text-gray-600">System maintenance</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/audit')}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-semibold">Audit Logs</div>
                    <div className="text-sm text-gray-600">Review system activity</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="text-gray-600 text-center py-8">
                  <div className="text-4xl mb-4">📈</div>
                  <p>Admin activity monitoring will be displayed here</p>
                  <p className="text-sm mt-2">Integration with admin APIs coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
