// components/PaymentForm.tsx
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface PaymentFormProps {
  amount: number;
  paymentType: 'thrift_contribution' | 'wallet_topup';
  thriftPlanId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function PaymentForm({
  amount,
  paymentType,
  thriftPlanId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  const handlePayment = async () => {
    if (!session?.user) {
      onError?.('Please log in to make a payment');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentType,
          thriftPlanId,
          description: description || `Payment for ${paymentType}`,
        }),
      });

      const data = await response.json();

      if (data.success && data.data && data.data.link) {
        // Redirect to Flutterwave checkout
        window.location.href = data.data.link;
        onSuccess?.(data);
      } else {
        onError?.(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError?.('An error occurred while processing your payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <div className="text-2xl font-bold text-green-600">
          ₦{amount.toLocaleString()}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter payment description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Pay with Flutterwave'}
      </button>

      <div className="mt-4 text-sm text-gray-600">
        <p>You will be redirected to Flutterwave&apos;s secure payment page</p>
        <p>Supported payment methods: Cards, Bank Transfer, USSD</p>
      </div>
    </div>
  );
}
