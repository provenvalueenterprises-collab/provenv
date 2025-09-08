// pages/add-thrift.tsx - Display available thrift plans for subscription
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Award, Info, CheckCircle } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';

interface ThriftPlan {
  id: string;
  name: string;
  description: string;
  plan_type: string;
  duration_months: number;
  accounts_count: number;
  registration_fee: number;
  daily_amount: number;
  total_contribution: number;
  settlement_amount: number;
  features: string[];
  risk_level: string;
  recommended_for: string;
  calculations: {
    totalContribution: number;
    settlementAmount: number;
    profit: number;
    registrationFee: number;
    dailyAmount: number;
    durationDays: number;
  };
}

export default function AddThrift() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<ThriftPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<ThriftPlan | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch('/api/thrift/available-plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      } else {
        console.error('Failed to fetch thrift plans');
      }
    } catch (error) {
      console.error('Error fetching thrift plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedPlan) {
      alert('Please select a contribution plan');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch('/api/thrift/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planType: selectedPlan.plan_type,
          accountsCount: selectedPlan.accounts_count,
          dailyAmount: selectedPlan.daily_amount,
          registrationFee: selectedPlan.registration_fee,
          settlementAmount: selectedPlan.settlement_amount,
          startDate: new Date().toISOString()
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Successfully enrolled in ${selectedPlan.name}! Your thrift journey begins now.`);
        router.push('/my-thrifts');
      } else {
        alert(`Enrollment failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll in thrift plan. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'very low': return 'text-green-600 bg-green-100';
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'medium-high': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading thrift plans...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard">
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </button>
              </Link>
              
              <div className="text-sm text-gray-600">
                Welcome, {session?.user?.name || session?.user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Contribution Package</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select from our carefully structured contribution packages. Each plan has fixed daily amounts, registration fees, 
              and guaranteed settlement amounts. Choose the package that fits your financial capacity and goals.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-xl ${
                  selectedPlan?.id === plan.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="p-6">
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                    {selectedPlan?.id === plan.id && (
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-bold text-blue-900">{plan.duration_months} months</div>
                      <div className="text-xs text-blue-600">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-sm font-bold text-green-900">₦{plan.calculations.profit.toLocaleString()}</div>
                      <div className="text-xs text-green-600">Profit</div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Accounts:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(plan.risk_level)}`}>
                        {plan.risk_level} Risk
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {plan.accounts_count} Account{plan.accounts_count > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration Fee:</span>
                        <span className="font-semibold">₦{plan.registration_fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Amount:</span>
                        <span className="font-semibold">₦{plan.daily_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Contribution:</span>
                        <span className="font-semibold">₦{plan.total_contribution.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600 font-semibold">Settlement Amount:</span>
                        <span className="font-bold text-green-600">₦{plan.settlement_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Features:</div>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-blue-600">+ {plan.features.length - 3} more features</li>
                      )}
                    </ul>
                  </div>

                  {/* Recommended For */}
                  <div className="text-xs text-gray-600">
                    <strong>Recommended for:</strong> {plan.recommended_for}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enrollment Section */}
          {selectedPlan && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Enroll in {selectedPlan.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Summary */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Plan Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 bg-blue-50 rounded">
                      <span className="text-gray-600">Registration Fee:</span>
                      <span className="font-bold text-blue-900">₦{selectedPlan.registration_fee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Daily Contribution:</span>
                      <span className="font-bold">₦{selectedPlan.daily_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Total Contribution:</span>
                      <span className="font-bold">₦{selectedPlan.total_contribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded">
                      <span className="text-gray-600">Settlement Amount:</span>
                      <span className="font-bold text-green-700">₦{selectedPlan.settlement_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-yellow-50 rounded border">
                      <span className="text-gray-600 font-semibold">Total Profit:</span>
                      <span className="font-bold text-yellow-700">₦{selectedPlan.calculations.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Plan Details</h4>
                  <div className="text-sm text-gray-600 space-y-2 mb-4">
                    <div><strong>Duration:</strong> {selectedPlan.duration_months} months</div>
                    <div><strong>Accounts:</strong> {selectedPlan.accounts_count} account{selectedPlan.accounts_count > 1 ? 's' : ''}</div>
                    <div><strong>Risk Level:</strong> {selectedPlan.risk_level}</div>
                    <div><strong>Plan Type:</strong> {selectedPlan.plan_type}</div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">All Features:</h4>
                    <ul className="space-y-1">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important Notice:</p>
                    <p>The registration fee of ₦{selectedPlan.registration_fee.toLocaleString()} will be deducted from your wallet immediately upon enrollment. 
                    Daily contributions of ₦{selectedPlan.daily_amount.toLocaleString()} will start automatically from tomorrow.</p>
                  </div>
                </div>
              </div>

              {/* Enroll Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
                >
                  {enrolling ? '⏳ Enrolling...' : `🚀 Enroll Now - Pay ₦${selectedPlan.registration_fee.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}

          {/* Information Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Contribution Package Information</h3>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Each package has a fixed registration fee and daily contribution amount</li>
                  <li>• Registration fee is paid once at enrollment, daily contributions start the next day</li>
                  <li>• Daily contributions are automatically deducted from your wallet every 24 hours</li>
                  <li>• Settlement amounts are guaranteed and paid upon successful completion</li>
                  <li>• Maintain sufficient wallet balance daily to avoid missed contributions</li>
                  <li>• Multiple accounts in higher packages provide better settlement ratios</li>
                  <li>• Monitor your progress and upcoming payments in "My Thrifts" section</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
