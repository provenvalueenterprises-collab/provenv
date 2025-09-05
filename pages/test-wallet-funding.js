import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function WalletTestPage() {
  const { data: session, status } = useSession()
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testAmount, setTestAmount] = useState('100')

  const fetchWalletBalance = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/wallet/virtual-account')
      const data = await response.json()
      
      if (response.ok) {
        setWalletBalance(data.user?.walletBalance || 0)
      } else {
        setError(data.error || 'Failed to fetch wallet balance')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const testWalletFunding = async () => {
    if (!testAmount || parseFloat(testAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(testAmount),
          reference: `TEST_${Date.now()}`,
          description: 'Test wallet funding'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(`Wallet funded successfully! New balance: ₦${data.data.newBalance}`)
        fetchWalletBalance() // Refresh balance
      } else {
        setError(data.error || 'Failed to fund wallet')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchWalletBalance()
    }
  }, [session])

  if (status === 'loading') {
    return <div style={{ padding: '20px' }}>Loading session...</div>
  }

  if (!session) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Wallet Test Page</h1>
        <p>You need to be logged in to test wallet functionality.</p>
        <button onClick={() => window.location.href = '/api/auth/signin'}>
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Wallet Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>Session Info:</strong>
        <br />
        Email: {session.user.email}
        <br />
        Name: {session.user.name}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Current Wallet Balance</h2>
        <div style={{ fontSize: '24px', color: '#2e7d32', marginBottom: '10px' }}>
          ₦{walletBalance.toFixed(2)}
        </div>
        <button 
          onClick={fetchWalletBalance} 
          disabled={loading}
          style={{ padding: '10px 20px', marginBottom: '10px' }}
        >
          {loading ? 'Loading...' : 'Refresh Balance'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Wallet Funding</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            placeholder="Enter amount to fund"
            style={{ padding: '10px', marginRight: '10px', width: '200px' }}
            min="1"
            step="0.01"
          />
          <button 
            onClick={testWalletFunding}
            disabled={loading}
            style={{ padding: '10px 20px' }}
          >
            {loading ? 'Processing...' : 'Fund Wallet (Test)'}
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#666' }}>
          This will simulate a successful payment and add the amount to your wallet balance.
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffe6e6', color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '10px', backgroundColor: '#f8f8f8' }}>
        <h3>Wallet Funding Process</h3>
        <p>When users make payments through Monnify or Flutterwave:</p>
        <ol>
          <li>Payment is processed by the payment provider</li>
          <li>Webhook is sent to our server (or payment verification is called)</li>
          <li>Our server verifies the payment</li>
          <li>Wallet balance is updated in the database</li>
          <li>Transaction is logged for record keeping</li>
        </ol>
        <p><strong>Note:</strong> If payments are successful but wallet balance isn&apos;t updating, check that:</p>
        <ul>
          <li>Webhook URLs are configured correctly with payment providers</li>
          <li>Payment verification is being called after successful payments</li>
          <li>Database transactions are completing successfully</li>
        </ul>
      </div>
    </div>
  )
}
