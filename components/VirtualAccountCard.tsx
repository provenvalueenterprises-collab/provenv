import { useState, useEffect } from 'react'
import FlutterwaveFunding from './FlutterwaveFunding'

interface VirtualAccount {
  id: string
  accountNumber: string
  bankName: string
  accountName: string
  reference: string
  isActive: boolean
  createdAt: string
}

interface User {
  id: string
  email: string
  displayName: string
  walletBalance: number
  hasNin: boolean
}

interface VirtualAccountData {
  user: User
  virtualAccount: VirtualAccount | null
}

const VirtualAccountCard = () => {
  const [virtualAccountData, setVirtualAccountData] = useState<VirtualAccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNinModal, setShowNinModal] = useState(false)
  const [nin, setNin] = useState('')
  const [creating, setCreating] = useState(false)
  const [showFlutterwaveFunding, setShowFlutterwaveFunding] = useState(false)

  useEffect(() => {
    fetchVirtualAccountData()
  }, [])

  const fetchVirtualAccountData = async () => {
    try {
      const response = await fetch('/api/wallet/virtual-account')
      if (response.ok) {
        const data = await response.json()
        setVirtualAccountData(data)
      } else {
        console.error('Failed to fetch virtual account data')
      }
    } catch (error) {
      console.error('Error fetching virtual account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVirtualAccount = async () => {
    if (!nin || nin.length !== 11) {
      alert('Please enter a valid 11-digit NIN')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/wallet/create-virtual-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin })
      })

      if (response.ok) {
        const result = await response.json()
        alert('Virtual account created successfully!')
        setShowNinModal(false)
        setNin('')
        fetchVirtualAccountData() // Refresh data
      } else {
        const error = await response.json()
        alert(`Failed to create virtual account: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating virtual account:', error)
      alert('Failed to create virtual account. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleFlutterwaveSuccess = (response: any) => {
    console.log('Flutterwave payment successful:', response)
    // Refresh wallet balance
    fetchVirtualAccountData()
    setShowFlutterwaveFunding(false)
    alert('Wallet funding successful! Your wallet will be credited shortly.')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy to clipboard')
    })
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          Loading virtual account details...
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
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: 0
          }}>
            Virtual Account
          </h3>
        </div>

        {virtualAccountData?.virtualAccount ? (
          <div>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  color: '#374151', 
                  fontWeight: '500',
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
                    fontWeight: 'bold', 
                    color: '#1f2937',
                    fontFamily: 'monospace'
                  }}>
                    {virtualAccountData.virtualAccount.accountNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(virtualAccountData.virtualAccount?.accountNumber || '')}
                    style={{
                      backgroundColor: '#e5e7eb',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  color: '#374151', 
                  fontWeight: '500',
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
                  {virtualAccountData.virtualAccount.bankName}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  color: '#374151', 
                  fontWeight: '500',
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
                  {virtualAccountData.virtualAccount.accountName}
                </span>
              </div>

              <div style={{
                backgroundColor: '#dbeafe',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '14px',
                color: '#1e40af'
              }}>
                <strong>💡 How to fund your wallet:</strong><br />
                Transfer money to the account number above using any bank app or USSD. 
                Your wallet will be credited automatically within minutes.
              </div>
            </div>

            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#047857', 
                marginBottom: '8px' 
              }}>
                Current Wallet Balance
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#065f46' 
              }}>
                ₦{virtualAccountData.user.walletBalance?.toLocaleString() || '0.00'}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '16px' 
            }}>
              <button
                onClick={() => setShowFlutterwaveFunding(true)}
                style={{
                  flex: 1,
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                💳 Fund with Card
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '20px',
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
                fontSize: '14px',
                marginBottom: '0'
              }}>
                Create a virtual account to easily fund your wallet and start investing
              </p>
            </div>

            <button
              onClick={() => setShowNinModal(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🚀 Generate Virtual Account
            </button>
          </div>
        )}
      </div>

      {/* Flutterwave Funding Component */}
      {showFlutterwaveFunding && virtualAccountData?.user && (
        <FlutterwaveFunding 
          user={virtualAccountData.user} 
          onSuccess={handleFlutterwaveSuccess}
          onClose={() => setShowFlutterwaveFunding(false)}
        />
      )}

      {/* NIN Input Modal */}
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
            padding: '30px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '16px',
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
              Your National Identification Number (NIN) is required to create a virtual account
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                fontSize: '14px', 
                color: '#374151', 
                fontWeight: '500',
                display: 'block',
                marginBottom: '8px'
              }}>
                NIN (11 digits)
              </label>
              <input
                type="text"
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="Enter your 11-digit NIN"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'monospace'
                }}
                maxLength={11}
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
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleCreateVirtualAccount}
                disabled={creating || nin.length !== 11}
                style={{
                  backgroundColor: creating || nin.length !== 11 ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  cursor: creating || nin.length !== 11 ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? '⏳ Creating...' : '✅ Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VirtualAccountCard
