import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import VirtualAccountCard from '../components/VirtualAccountCard'

interface DashboardData {
  user: {
    name: string
    email: string
    phone?: string
    role?: string
  }
  cards: {
    walletBalance: number
    activationDate: string
    maturityDate: string
    currentBalance: number
    currentWeek: number
    ledgerBalance: number
    totalDefaults: number
    defaultWeek: number
    totalThriftAccounts: number
    totalReferrals: number
    pendingSettlementAccounts: number
    totalPaidAccounts: number
    referralsWithin60Days: number
    bonusWallet: number
  }
  thriftAccounts: any[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login')
      return
    }

    // Check if user is admin and redirect to admin dashboard
    if (session.user?.role === 'admin') {
      router.push('/admin/dashboard')
      return
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/investor-comprehensive')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          setError('Failed to load dashboard data')
        }
      } catch (err) {
        setError('Network error')
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session, status, router])

  const handleLogout = async () => {
    try {
      console.log('Logging out user...')
      await signOut({ 
        callbackUrl: '/login',
        redirect: true
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

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
          <div style={{ fontSize: '18px' }}>Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>❌</div>
          <div style={{ fontSize: '18px' }}>Error: {error}</div>
        </div>
      </div>
    )
  }

  const data = dashboardData!

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '250px',
        height: '100vh',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '30px', color: '#10b981' }}>
          🎯 ProVenv Dashboard
        </h2>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            backgroundColor: '#374151',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>User:</div>
            <div style={{ fontWeight: 'bold' }}>{data.user.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>{data.user.email}</div>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🚪 Logout
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => router.push('/my-thrifts')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #374151',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px'
            }}
          >
            🎯 My Thrifts
          </button>
          <button 
            onClick={() => router.push('/add-thrift')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #374151',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px'
            }}
          >
            ➕ Add Thrift Account
          </button>
          <button 
            onClick={() => router.push('/wallet-transactions')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #374151',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px'
            }}
          >
            💳 Wallet Transactions
          </button>
          <button 
            onClick={() => router.push('/plans')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #374151',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px'
            }}
          >
            📋 Plans
          </button>
          <button 
            onClick={() => router.push('/fund-wallet')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #374151',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px'
            }}
          >
            💳 Fund Wallet
          </button>
          <button 
            onClick={() => router.push('/profile')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #374151',
              padding: '12px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px'
            }}
          >
            👤 Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#1f2937' }}>
          Welcome to your dashboard!
        </h1>
        
        {/* Virtual Account Section */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#1f2937' }}>
            🏦 Virtual Account
          </h2>
          <VirtualAccountCard />
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Wallet Balance */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151'
            }}>
              💰 Wallet Balance
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              ₦{data.cards.walletBalance.toLocaleString()}
            </div>
          </div>

          {/* Current Balance */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151'
            }}>
              💵 Current Balance
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              ₦{data.cards.currentBalance.toLocaleString()}
            </div>
          </div>

          {/* Total Thrift Accounts */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151'
            }}>
              🎯 Total Thrift Accounts
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {data.cards.totalThriftAccounts}
            </div>
          </div>

          {/* Current Week */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151'
            }}>
              📅 Current Week
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              Week {data.cards.currentWeek}
            </div>
          </div>

          {/* Total Referrals */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151'
            }}>
              👥 Total Referrals
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
              {data.cards.totalReferrals}
            </div>
          </div>

          {/* Bonus Wallet */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151'
            }}>
              🎁 Bonus Wallet (Affiliate earnings)
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              ₦{data.cards.bonusWallet.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#1f2937' }}>
            📈 Account Summary
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <div>
              <strong>Account Status:</strong> Active<br/>
              <strong>Activation Date:</strong> {data.cards.activationDate}<br/>
              <strong>Maturity Date:</strong> {data.cards.maturityDate}
            </div>
            <div>
              <strong>Paid Accounts:</strong> {data.cards.totalPaidAccounts}<br/>
              <strong>Pending Settlement:</strong> {data.cards.pendingSettlementAccounts}<br/>
              <strong>Total Defaults:</strong> {data.cards.totalDefaults}
            </div>
            <div>
              <strong>Recent Referrals (60 days):</strong> {data.cards.referralsWithin60Days}<br/>
              <strong>Affiliate Earnings:</strong> ₦{data.cards.bonusWallet.toLocaleString()}<br/>
              <strong>Ledger Balance:</strong> ₦{data.cards.ledgerBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
