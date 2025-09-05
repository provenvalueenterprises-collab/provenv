import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function WalletTest() {
  const { data: session } = useSession()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const simulatePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/payments/simulate-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod: 'test'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setAmount('')
      } else {
        setError(data.error || 'Payment simulation failed')
      }
    } catch (error) {
      setError('Network error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to test wallet payments</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Wallet Payment Test</h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Mode</h2>
            <p className="text-blue-700">
              This page simulates successful wallet payments without requiring webhooks.
              Perfect for testing wallet balance updates locally.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Fund (₦)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount (e.g., 1000)"
                min="1"
                step="0.01"
              />
            </div>

            <button
              onClick={simulatePayment}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Simulate Successful Payment'}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Payment Successful!</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p><strong>Reference:</strong> {result.data.reference}</p>
                  <p><strong>Previous Balance:</strong> ₦{result.data.previousBalance}</p>
                  <p><strong>Amount Added:</strong> ₦{result.data.amountAdded}</p>
                  <p><strong>New Balance:</strong> ₦{result.data.newBalance}</p>
                  <p><strong>Status:</strong> {result.data.transaction.status}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Simulates a successful payment without external payment provider</li>
              <li>• Immediately updates your wallet balance in the database</li>
              <li>• Creates a transaction record for tracking</li>
              <li>• Perfect for testing wallet functionality locally</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
