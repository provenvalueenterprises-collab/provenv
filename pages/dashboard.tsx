import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

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
    bonusWallet: string | number
  }
  thriftAccounts: any[]
  virtualAccount: {
    id: string
    accountNumber: string
    bankName: string
    accountName: string
    accountReference: string
    isActive: boolean
    createdAt: string
  } | null
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }

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
        // Fetch dashboard data
        const dashboardResponse = await fetch('/api/dashboard/investor-comprehensive')
        
        // Fetch virtual account data
        const virtualAccountResponse = await fetch('/api/wallet/virtual-account')
        
        if (dashboardResponse.ok && virtualAccountResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          const virtualAccountData = await virtualAccountResponse.json()
          
          // Combine the data
          const combinedData = {
            ...dashboardData,
            virtualAccount: virtualAccountData.virtualAccount
          }
          
          setDashboardData(combinedData)
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

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Virtual Account Cards */}
          {data.virtualAccount ? (
            /* Single Virtual Account Card */
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '10px',
                opacity: 0.9
              }}>
                🏦 Virtual Account
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                marginBottom: '4px',
                letterSpacing: '0.5px'
              }}>
                {data.virtualAccount.accountNumber}
              </div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8,
                marginBottom: '4px'
              }}>
                {data.virtualAccount.bankName}
              </div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8,
                marginBottom: '8px'
              }}>
                {data.virtualAccount.accountName}
              </div>
              <button
                onClick={() => copyToClipboard(data.virtualAccount?.accountNumber || '')}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '4px 4px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                📋 Copy
              </button>
            </div>
          ) : (
            /* No Virtual Account Card */
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '10px',
                opacity: 0.9
              }}>
                🏦 Virtual Account
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold'
              }}>
                Not Set
              </div>
            </div>
          )}

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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              ₦{data.cards.currentBalance.toLocaleString()}
            </div>
          </div>

          {/* Ledger Balance */}
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
              📊 Ledger Balance
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              ₦{data.cards.ledgerBalance.toLocaleString()}
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {data.cards.totalThriftAccounts}
            </div>
          </div>

          {/* Current Day */}
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
              📅 Current Day
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>
              Day {data.cards.currentWeek}
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              {data.cards.totalReferrals}
            </div>
          </div>

          {/* Referrals Within 60 Days */}
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
              🕐 Recent Referrals (60 days)
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ec4899' }}>
              {data.cards.referralsWithin60Days}
            </div>
          </div>

          {/* Total Defaults */}
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
              ⚠️ Total Defaults
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {data.cards.totalDefaults}
            </div>
          </div>

          {/* Default Day */}
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
              📆 Default Day
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>
              Day {data.cards.defaultWeek}
            </div>
          </div>

          {/* Pending Settlement Accounts */}
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
              ⏳ Pending Settlement
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#facc15' }}>
              {data.cards.pendingSettlementAccounts}
            </div>
          </div>

          {/* Total Paid Accounts */}
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
              ✅ Total Paid Accounts
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
              {data.cards.totalPaidAccounts}
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
              🎁 Bonus Wallet
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              ₦{typeof data.cards.bonusWallet === 'string' 
                ? parseFloat(data.cards.bonusWallet).toLocaleString() 
                : data.cards.bonusWallet.toLocaleString()}
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
              <strong>Maturity Date:</strong> {data.cards.maturityDate}<br/>
              <strong>Current Day:</strong> Day {data.cards.currentWeek}
            </div>
            <div>
              <strong>Total Paid Accounts:</strong> {data.cards.totalPaidAccounts}<br/>
              <strong>Pending Settlement:</strong> {data.cards.pendingSettlementAccounts}<br/>
              <strong>Total Defaults:</strong> {data.cards.totalDefaults}<br/>
              <strong>Default Day:</strong> Day {data.cards.defaultWeek}
            </div>
            <div>
              <strong>Total Referrals:</strong> {data.cards.totalReferrals}<br/>
              <strong>Recent Referrals (60 days):</strong> {data.cards.referralsWithin60Days}<br/>
              <strong>Bonus Wallet:</strong> ₦{typeof data.cards.bonusWallet === 'string' 
                ? parseFloat(data.cards.bonusWallet).toLocaleString() 
                : data.cards.bonusWallet.toLocaleString()}<br/>
              <strong>Ledger Balance:</strong> ₦{data.cards.ledgerBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
