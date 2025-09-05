import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function TestFlutterwave() {
  const { data: session } = useSession()
  const [virtualAccount, setVirtualAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nin, setNin] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      fetchVirtualAccount()
    }
  }, [session])

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
        if (response.status === 404) {
          setShowCreateForm(true)
        }
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching virtual account:', err)
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nin }),
      })

      const data = await response.json()

      if (response.ok) {
        setVirtualAccount(data.virtualAccount)
        setShowCreateForm(false)
        setError('')
        alert('Virtual account created successfully!')
      } else {
        setError(data.error || 'Failed to create virtual account')
        alert('Error: ' + (data.error || 'Failed to create virtual account'))
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error creating virtual account:', err)
      alert('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🔒 Please log in to test Flutterwave integration</h1>
        <p>You need to be logged in to create and view virtual accounts.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🧪 Flutterwave Virtual Account Test</h1>
      
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>📧 Logged in as: {session.user.email}</h3>
        <p>User ID: {session.user.id || 'Not available'}</p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>⏳ Loading...</p>
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          ❌ {error}
        </div>
      )}

      {virtualAccount ? (
        <div style={{ 
          backgroundColor: '#ecfdf5', 
          border: '1px solid #10b981', 
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2>✅ Virtual Account Found</h2>
          <div style={{ marginBottom: '12px' }}>
            <strong>Account Number:</strong> {virtualAccount.accountNumber}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Bank Name:</strong> {virtualAccount.bankName}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Account Name:</strong> {virtualAccount.accountName}
          </div>
          <div>
            <strong>Account Reference:</strong> {virtualAccount.accountReference}
          </div>

          <div style={{ 
            backgroundColor: '#dbeafe', 
            padding: '12px', 
            borderRadius: '6px', 
            marginTop: '16px' 
          }}>
            <strong>💡 How to fund your wallet:</strong><br />
            Transfer money to this account number from any Nigerian bank. 
            Your wallet will be automatically credited within minutes.
          </div>
        </div>
      ) : showCreateForm ? (
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '1px solid #f59e0b', 
          borderRadius: '8px', 
          padding: '20px' 
        }}>
          <h2>🏦 Create Virtual Account</h2>
          <p>You don't have a virtual account yet. Create one to start funding your wallet.</p>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold' 
            }}>
              Enter your NIN:
            </label>
            <input
              type="text"
              value={nin}
              onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 11-digit NIN"
              maxLength={11}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            onClick={createVirtualAccount}
            disabled={loading || !nin || nin.length !== 11}
            style={{
              backgroundColor: loading || !nin || nin.length !== 11 ? '#9ca3af' : '#10b981',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: loading || !nin || nin.length !== 11 ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? '⏳ Creating Account...' : '🏦 Generate Virtual Account'}
          </button>
        </div>
      ) : null}

      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '16px', 
        borderRadius: '8px',
        textAlign: 'center',
        marginTop: '24px'
      }}>
        <h3>🔧 Debug Actions</h3>
        <button
          onClick={fetchVirtualAccount}
          disabled={loading}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '12px'
          }}
        >
          🔄 Refresh Virtual Account
        </button>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showCreateForm ? '❌ Hide Create Form' : '➕ Show Create Form'}
        </button>
      </div>

      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280', 
        textAlign: 'center', 
        marginTop: '20px' 
      }}>
        🔒 Test Environment • Flutterwave Integration
      </div>
    </div>
  )
}
