import { useState, useEffect } from 'react'

export default function SimpleVirtualAccountCard({ user }) {
  const [virtualAccount, setVirtualAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nin, setNin] = useState('')
  const [showNinModal, setShowNinModal] = useState(false)
  const [showFunding, setShowFunding] = useState(false)

  useEffect(() => {
    if (user?.email) {
      fetchVirtualAccount()
    }
  }, [user])

  const fetchVirtualAccount = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wallet/virtual-account')
      const data = await response.json()
      
      if (response.ok) {
        setVirtualAccount(data.virtualAccount)
        setError('')
      } else {
        setError(data.error || 'Failed to fetch virtual account')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createVirtualAccount = async () => {
    if (!nin || nin.length !== 11) {
      alert('Please enter a valid 11-digit NIN')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/wallet/create-virtual-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin }),
      })

      const data = await response.json()

      if (response.ok) {
        setVirtualAccount(data.virtualAccount)
        setShowNinModal(false)
        setNin('')
        alert('Virtual account created successfully!')
      } else {
        alert('Error: ' + (data.error || 'Failed to create virtual account'))
      }
    } catch (err) {
      alert('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading && !virtualAccount) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          ⏳ Loading virtual account...
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>🏦</span>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Virtual Account
          </h3>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {virtualAccount ? (
          <div>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Account Number
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    fontFamily: 'monospace'
                  }}>
                    {virtualAccount.accountNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(virtualAccount.accountNumber)}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Bank Name
                </label>
                <span style={{
                  fontSize: '16px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}>
                  {virtualAccount.bankName}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Account Name
                </label>
                <span style={{
                  fontSize: '16px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}>
                  {virtualAccount.accountName}
                </span>
              </div>

              <div style={{
                backgroundColor: '#dbeafe',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '14px',
                color: '#1e40af'
              }}>
                <strong>💡 How to fund your wallet:</strong><br />
                Transfer money to this account from any Nigerian bank. 
                Your wallet will be credited automatically.
              </div>
            </div>

            <button
              onClick={() => setShowFunding(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              💳 Fund with Card (Flutterwave)
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏦</div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                No Virtual Account
              </h4>
              <p style={{
                color: '#78350f',
                marginBottom: '0'
              }}>
                Create a virtual account to start funding your wallet
              </p>
            </div>
            <button
              onClick={() => setShowNinModal(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🏦 Generate Virtual Account
            </button>
          </div>
        )}
      </div>

      {/* NIN Modal */}
      {showNinModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              🆔 Enter Your NIN
            </h3>
            
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Your NIN is required to create a virtual account for wallet funding.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>
                National Identification Number (NIN)
              </label>
              <input
                type="text"
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your 11-digit NIN"
                maxLength={11}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowNinModal(false)
                  setNin('')
                }}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={createVirtualAccount}
                disabled={loading || !nin || nin.length !== 11}
                style={{
                  backgroundColor: loading || !nin || nin.length !== 11 ? '#9ca3af' : '#10b981',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: loading || !nin || nin.length !== 11 ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Creating...' : '✅ Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Funding Modal */}
      {showFunding && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                💳 Fund Wallet
              </h3>
              <button
                onClick={() => setShowFunding(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Click below to open the test payment page where you can fund your wallet using Flutterwave.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowFunding(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => window.open('/test-flutterwave-payment', '_blank')}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  flex: 2
                }}
              >
                💰 Open Payment Page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
