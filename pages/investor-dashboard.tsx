import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

interface DashboardData {
  user: {
    name: string
    email: string
    phone?: string
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

export default function InvestorDashboard() {
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
          <div style={{ fontSize: '18px' }}>Loading investor dashboard...</div>
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
          🎯 ProVenv Investor
        </h2>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            backgroundColor: '#374151',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Investor:</div>
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
            onClick={() => router.push('/settlement-accounts')}
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
            💰 Settlement Accounts
          </button>
          <button 
            onClick={() => router.push('/complaints')}
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
            📞 Complaints
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
            👤 My Profile
          </button>
          <button 
            onClick={() => router.push('/fund-wallet')}
            style={{
              backgroundColor: '#10b981',
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
            💳 Fund Wallet
          </button>
          <button 
            onClick={() => router.push('/terms-conditions')}
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
            📋 Terms & Conditions
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1f2937' }}>
            💼 Investor Dashboard
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Welcome back, {data.user.name}! Monitor your thrift investments and portfolio performance.
          </p>
        </div>

        {/* Investor Dashboard Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          
          {/* Wallet Balance */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              💰 Wallet Balance
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              ₦{data.cards.walletBalance.toLocaleString()}
            </div>
          </div>

          {/* Activation Date */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              📅 Activation Date
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
              {data.cards.activationDate}
            </div>
          </div>

          {/* Maturity Date */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              🎯 Maturity Date
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
              {data.cards.maturityDate}
            </div>
          </div>

          {/* Current Balance */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #3b82f6'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              💳 Current Balance
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              ₦{data.cards.currentBalance.toLocaleString()}
            </div>
          </div>

          {/* Current Week */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              📊 Current Week
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              Week {data.cards.currentWeek}
            </div>
          </div>

          {/* Ledger Balance */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              📋 Ledger Balance
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              ₦{data.cards.ledgerBalance.toLocaleString()}
            </div>
          </div>

          {/* Total Defaults */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #dc2626'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              ❌ Total Defaults
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {data.cards.totalDefaults}
            </div>
          </div>

          {/* Default Week */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              📉 Default Week
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              Week {data.cards.defaultWeek}
            </div>
          </div>

          {/* Total Thrift Accounts */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #3b82f6'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              📊 Total Thrift Accounts
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {data.cards.totalThriftAccounts}
            </div>
          </div>

          {/* Total Referrals */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #8b5cf6'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              👥 Total Referrals
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {data.cards.totalReferrals}
            </div>
          </div>

          {/* Pending Settlement Accounts */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #f59e0b'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              ⏳ Pending Settlement Accounts
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {data.cards.pendingSettlementAccounts}
            </div>
          </div>

          {/* Total Paid Accounts */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              ✅ Total Paid Accounts
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {data.cards.totalPaidAccounts}
            </div>
          </div>

          {/* Referrals Within 60 Days */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              🕒 Referrals Within 60 Days
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {data.cards.referralsWithin60Days}
            </div>
          </div>

          {/* Bonus Wallet (Affiliate earnings) */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              🎁 Bonus Wallet (Affiliate earnings)
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              ₦{data.cards.bonusWallet.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Active Thrift Accounts Summary */}
        {data.thriftAccounts && data.thriftAccounts.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginTop: '30px'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937' }}>
              🎯 Active Investment Accounts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {data.thriftAccounts.map((account: any, index: number) => (
                <div key={account.id} style={{
                  backgroundColor: '#f9fafb',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
                    {account.plan_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Balance: ₦{account.current_balance?.toLocaleString() || '0'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Status: {account.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investment Performance Summary */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginTop: '30px'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#1f2937' }}>
            📈 Investment Performance
          </h3>
          <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Current Portfolio Value:</strong> ₦{data.cards.currentBalance.toLocaleString()}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Projected Maturity Value:</strong> ₦{(data.cards.currentBalance * 1.2).toLocaleString()}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Investment Progress:</strong> Week {data.cards.currentWeek} of 52
            </div>
            <div>
              <strong>Affiliate Earnings:</strong> ₦{data.cards.bonusWallet.toLocaleString()}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
