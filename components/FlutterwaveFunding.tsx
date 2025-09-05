import React, { useState } from 'react'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'

interface FlutterwaveFundingProps {
  user: {
    id?: string;
    email: string;
    phone?: string;
    displayName?: string;
  };
  onSuccess: (transaction: any) => void;
  onClose: () => void;
}

const FlutterwaveFunding: React.FC<FlutterwaveFundingProps> = ({ user, onSuccess, onClose }) => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
    tx_ref: `FUND_${Date.now()}_${user.id || 'user'}`,
    amount: parseFloat(amount) || 0,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: user.email,
      phone_number: user.phone || '08000000000',
      name: user.displayName || user.email,
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
        console.log(response)
        closePaymentModal()
        
        if (response.status === 'successful') {
          alert(`Payment successful! Transaction ID: ${response.transaction_id}`)
          if (onSuccess) onSuccess(response)
        } else {
          alert('Payment failed or cancelled')
        }
        setLoading(false)
      },
      onClose: () => {
        console.log('Payment modal closed')
        setLoading(false)
      },
    })
  }

  return (
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
        justifyContent: 'space-between',
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>💳</span>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: 0
          }}>
            Fund Wallet with Flutterwave
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          fontSize: '14px', 
          color: '#374151', 
          fontWeight: '500',
          display: 'block',
          marginBottom: '8px'
        }}>
          Amount (₦)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (minimum ₦100)"
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px'
          }}
          min="100"
        />
      </div>

      <div style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '12px'
        }}>
          💡 Funding Options:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
          <li>💳 Debit/Credit Cards (Visa, Mastercard, Verve)</li>
          <li>🏦 Bank Transfer</li>
          <li>📱 USSD (*737#, *966#, etc.)</li>
          <li>📲 Mobile Money</li>
        </ul>
      </div>

      <button
        onClick={handleFunding}
        disabled={loading || !amount || parseFloat(amount) < 100}
        style={{
          width: '100%',
          backgroundColor: loading || !amount || parseFloat(amount) < 100 ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '14px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading || !amount || parseFloat(amount) < 100 ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '⏳ Processing...' : `💰 Fund Wallet with ₦${amount ? parseFloat(amount).toLocaleString() : '0'}`}
      </button>

      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        🔒 Secured by Flutterwave • Test Environment
      </div>
    </div>
  )
}

export default FlutterwaveFunding
