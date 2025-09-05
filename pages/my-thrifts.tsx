import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

interface ThriftAccount {
  id: string
  status: string
  start_date: string
  next_contribution_date: string
  total_contributed: number
  current_balance: number
  settlement_amount: number
  is_fast_track: boolean
  created_at: string
  plan_name: string
  daily_amount: number
  plan_settlement_amount: number
  registration_fee: number
  duration_months: number
  category: string
  days_active: number
  completion_percentage: number
  contributions: Contribution[]
  settlement?: SettlementAccount
}

interface Contribution {
  id: string
  thrift_account_id: string
  amount: number
  contribution_date: string
  status: string
  created_at: string
}

interface SettlementAccount {
  id: string
  thrift_account_id: string
  account_number: string
  bank_name: string
  account_name: string
  settlement_amount: number
  status: string
  settlement_date: string
  plan_name: string
}

interface MyThriftsData {
  success: boolean
  user: {
    name: string
    email: string
    phone: string
  }
  summary: {
    total_accounts: number
    active_accounts: number
    completed_accounts: number
    matured_accounts: number
    total_contributed: number
    total_expected_settlement: number
    total_settled: number
    pending_settlement: number
  }
  thrift_accounts: ThriftAccount[]
  recent_contributions: Contribution[]
  settlement_accounts: SettlementAccount[]
}

export default function MyThrifts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<MyThriftsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/login')
      return
    }

    fetchThrifts()
  }, [session, status, router])

  const fetchThrifts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/my-thrifts')
      if (response.ok) {
        const result = await response.json()
        setData(result)
        setError(null)
      } else {
        setError('Failed to fetch thrift data')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'active': { bg: '#dcfce7', color: '#166534', text: '🟢 Active' },
      'completed': { bg: '#f0f9ff', color: '#0369a1', text: '✅ Completed' },
      'settled': { bg: '#f0f9ff', color: '#0369a1', text: '✅ Settled' },
      'matured': { bg: '#fef3c7', color: '#92400e', text: '⏳ Matured' },
      'paused': { bg: '#fee2e2', color: '#991b1b', text: '⏸️ Paused' },
      'cancelled': { bg: '#f3f4f6', color: '#374151', text: '❌ Cancelled' }
    }
    
    const config = statusColors[status as keyof typeof statusColors] || statusColors['active']
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {config.text}
      </span>
    )
  }

  const getFilteredAccounts = () => {
    if (!data) return []
    
    switch (activeTab) {
      case 'active':
        return data.thrift_accounts.filter(acc => acc.status === 'active')
      case 'completed':
        return data.thrift_accounts.filter(acc => ['completed', 'settled', 'matured'].includes(acc.status))
      case 'all':
      default:
        return data.thrift_accounts
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
          <div style={{ fontSize: '18px' }}>Loading your thrifts...</div>
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
          <button 
            onClick={fetchThrifts}
            style={{
              marginTop: '20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

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
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '30px', color: '#10b981' }}>
          🎯 ProVenv Investor Portal
        </h2>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            backgroundColor: '#374151',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Logged in as:</div>
            <div style={{ fontWeight: 'bold' }}>{data?.user.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>{data?.user.email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => router.push('/dashboard')}
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
            📊 Dashboard
          </button>
          <button 
            onClick={() => router.push('/my-thrifts')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
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
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#1f2937'
            }}>
              🎯 My Thrifts
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '30px',
              fontSize: '16px'
            }}>
              Track your thrift savings, contributions, and earnings
            </p>

            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dbeafe'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                  {data?.summary.total_accounts || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Thrifts</div>
              </div>
              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dcfce7'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                  {data?.summary.active_accounts || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Active</div>
              </div>
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #fcd34d'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>
                  {formatCurrency(data?.summary.total_contributed || 0)}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Contributed</div>
              </div>
              <div style={{
                backgroundColor: '#ecfdf5',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #a7f3d0'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46' }}>
                  {formatCurrency(data?.summary.total_expected_settlement || 0)}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Expected Settlement</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {['active', 'completed', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: activeTab === tab ? '#f3f4f6' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeTab === tab ? '600' : '400',
                    color: activeTab === tab ? '#1f2937' : '#6b7280',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab} Thrifts
                </button>
              ))}
            </div>

            {/* Thrift Accounts List */}
            <div style={{ padding: '20px' }}>
              {getFilteredAccounts().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '20px' }}>
                    No {activeTab} thrifts found
                  </p>
                  {activeTab === 'active' && (
                    <button
                      onClick={() => router.push('/add-thrift')}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      ➕ Start Your First Thrift
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px'
                }}>
                  {getFilteredAccounts().map((account) => (
                    <div
                      key={account.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '20px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {/* Account Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            margin: '0 0 4px 0'
                          }}>
                            {account.plan_name}
                          </h3>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Started: {formatDate(account.start_date)}
                          </div>
                        </div>
                        {getStatusBadge(account.status)}
                      </div>

                      {/* Progress Bar */}
                      {account.status === 'active' && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                          }}>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {Math.round(account.completion_percentage)}%
                            </span>
                          </div>
                          <div style={{
                            height: '6px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              backgroundColor: '#10b981',
                              width: `${Math.min(100, account.completion_percentage)}%`,
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      )}

                      {/* Financial Details */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                            Daily Amount
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                            {formatCurrency(account.daily_amount)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                            Contributed
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                            {formatCurrency(account.total_contributed)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                            Current Balance
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                            {formatCurrency(account.current_balance)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                            Settlement
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>
                            {formatCurrency(account.settlement_amount)}
                          </div>
                        </div>
                      </div>

                      {/* Next Contribution */}
                      {account.status === 'active' && (
                        <div style={{
                          backgroundColor: '#f9fafb',
                          padding: '12px',
                          borderRadius: '6px',
                          marginBottom: '12px'
                        }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                            Next Contribution
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                            {formatDate(account.next_contribution_date)}
                          </div>
                        </div>
                      )}

                      {/* Recent Contributions */}
                      {account.contributions.length > 0 && (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '8px',
                            fontWeight: '500'
                          }}>
                            Recent Contributions ({account.contributions.length})
                          </div>
                          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                            {account.contributions.slice(0, 3).map((contribution) => (
                              <div
                                key={contribution.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '6px 0',
                                  borderBottom: '1px solid #f3f4f6',
                                  fontSize: '12px'
                                }}
                              >
                                <span style={{ color: '#6b7280' }}>
                                  {formatDate(contribution.contribution_date)}
                                </span>
                                <span style={{
                                  fontWeight: '500',
                                  color: contribution.status === 'completed' ? '#059669' : '#f59e0b'
                                }}>
                                  {formatCurrency(contribution.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
