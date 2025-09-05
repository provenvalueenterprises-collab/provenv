import { useState } from 'react'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'

export default function TestFlutterwaveFunding() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Mock user data for testing
  const mockUser = {
    id: 'test-user-123',
    email: 'realsammy86@gmail.com',
    phone: '08000000000',
    displayName: 'Test User'
  }

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
    tx_ref: `FUND_${Date.now()}_${mockUser.id}`,
    amount: parseFloat(amount) || 0,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: mockUser.email,
      phone_number: mockUser.phone,
      name: mockUser.displayName,
    },
    customizations: {
      title: 'Fund ProVenv Wallet',
      description: 'Add money to your ProVenv investment wallet',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  }

  const handleFlutterPayment = useFlutterwave(config)

  const handleFunding = () => {
    if (!amount || parseFloat(amount) < 100) {
      alert('Please enter an amount of at least ₦100')
      return
    }

    setLoading(true)
    handleFlutterPayment({
      callback: (response) => {
        console.log('Flutterwave Response:', response)
        setResult(response)
        setLoading(false)
        closePaymentModal()
        
        if (response.status === 'successful') {
          alert(`Payment successful! Amount: ₦${response.amount}`)
        } else {
          alert('Payment was not completed')
        }
      },
      onClose: () => {
        console.log('Payment modal closed')
        setLoading(false)
      },
    })
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>🧪 Flutterwave Payment Test</h1>
      
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>👤 Test User Data</h3>
        <p><strong>Email:</strong> {mockUser.email}</p>
        <p><strong>Phone:</strong> {mockUser.phone}</p>
        <p><strong>Name:</strong> {mockUser.displayName}</p>
      </div>

      <div style={{ 
        backgroundColor: '#fef3c7', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>💰 Test Payment</h3>
        <p>Enter an amount to test the Flutterwave payment integration.</p>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold' 
          }}>
            Amount (₦):
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (minimum ₦100)"
            min="100"
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
          onClick={handleFunding}
          disabled={loading || !amount || parseFloat(amount) < 100}
          style={{
            backgroundColor: loading || !amount || parseFloat(amount) < 100 ? '#9ca3af' : '#10b981',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading || !amount || parseFloat(amount) < 100 ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? '⏳ Processing...' : `💰 Pay ₦${amount ? parseFloat(amount).toLocaleString() : '0'} with Flutterwave`}
        </button>
      </div>

      {result && (
        <div style={{ 
          backgroundColor: result.status === 'successful' ? '#ecfdf5' : '#fee2e2',
          border: `1px solid ${result.status === 'successful' ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px', 
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3>{result.status === 'successful' ? '✅ Payment Successful' : '❌ Payment Failed'}</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}

      <div style={{ 
        backgroundColor: '#dbeafe', 
        padding: '12px', 
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <strong>💡 Test Instructions:</strong><br />
        1. Enter any amount ≥ ₦100<br />
        2. Click the pay button<br />
        3. Use test card: 4187427415564246<br />
        4. CVV: 828, Expiry: 09/32, PIN: 3310<br />
        5. OTP: 12345
      </div>

      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280', 
        textAlign: 'center', 
        marginTop: '20px' 
      }}>
        🔒 Test Environment • Flutterwave Integration<br />
        Public Key: {process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ? '✅ Loaded' : '❌ Missing'}
      </div>
    </div>
  )
}
