import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function TestVirtualAccount() {
  const { data: session, status } = useSession()
  const [virtualAccount, setVirtualAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nin, setNin] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const fetchVirtualAccount = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/wallet/virtual-account')
      const data = await response.json()
      
      if (response.ok) {
        setVirtualAccount(data)
      } else {
        setError(data.error || 'Failed to fetch virtual account')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const createVirtualAccount = async () => {
    if (!nin.trim()) {
      setError('Please enter your NIN')
      return
    }

    setCreateLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/wallet/create-virtual-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nin: nin.trim() })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Virtual account created successfully!')
        setNin('')
        fetchVirtualAccount() // Refresh the data
      } else {
        setError(data.error || 'Failed to create virtual account')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchVirtualAccount()
    }
  }, [session])

  if (status === 'loading') {
    return <div style={{ padding: '20px' }}>Loading session...</div>
  }

  if (!session) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Virtual Account Test</h1>
        <p>You need to be logged in to test virtual accounts.</p>
        <button onClick={() => window.location.href = '/api/auth/signin'}>
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Virtual Account Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>Session Info:</strong>
        <br />
        Email: {session.user.email}
        <br />
        Name: {session.user.name}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Current Virtual Account</h2>
        <button 
          onClick={fetchVirtualAccount} 
          disabled={loading}
          style={{ padding: '10px 20px', marginBottom: '10px' }}
        >
          {loading ? 'Loading...' : 'Refresh Virtual Account'}
        </button>
        
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#ffe6e6', color: 'red', marginBottom: '10px' }}>
            Error: {error}
          </div>
        )}
        
        {virtualAccount ? (
          <div style={{ padding: '10px', backgroundColor: '#e6ffe6' }}>
            <h3>User Info:</h3>
            <p>ID: {virtualAccount.user.id}</p>
            <p>Email: {virtualAccount.user.email}</p>
            <p>Display Name: {virtualAccount.user.displayName}</p>
            <p>Wallet Balance: ₦{virtualAccount.user.walletBalance}</p>
            <p>Has NIN: {virtualAccount.user.hasNin ? 'Yes' : 'No'}</p>
            
            <h3>Virtual Account:</h3>
            {virtualAccount.virtualAccount ? (
              <div>
                <p>Account Number: {virtualAccount.virtualAccount.accountNumber}</p>
                <p>Bank Name: {virtualAccount.virtualAccount.bankName}</p>
                <p>Account Name: {virtualAccount.virtualAccount.accountName}</p>
                <p>Reference: {virtualAccount.virtualAccount.accountReference}</p>
                <p>Active: {virtualAccount.virtualAccount.isActive ? 'Yes' : 'No'}</p>
                <p>Created: {new Date(virtualAccount.virtualAccount.createdAt).toLocaleString()}</p>
              </div>
            ) : (
              <p>No virtual account found</p>
            )}
          </div>
        ) : !loading && !error && (
          <p>No data loaded yet</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Create Virtual Account</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={nin}
            onChange={(e) => setNin(e.target.value)}
            placeholder="Enter your NIN (11 digits)"
            style={{ padding: '10px', marginRight: '10px', width: '200px' }}
            maxLength={11}
          />
          <button 
            onClick={createVirtualAccount}
            disabled={createLoading}
            style={{ padding: '10px 20px' }}
          >
            {createLoading ? 'Creating...' : 'Create Virtual Account'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '10px', backgroundColor: '#f8f8f8' }}>
        <h3>API Test Results</h3>
        <p>This page directly tests the virtual account APIs:</p>
        <ul>
          <li>GET /api/wallet/virtual-account - Fetch existing virtual account</li>
          <li>POST /api/wallet/create-virtual-account - Create new virtual account</li>
        </ul>
      </div>
    </div>
  )
}
