import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, ArrowLeft, CreditCard } from 'lucide-react';

const PlanSelection = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const standardPlans = [
    {
      id: '1-account',
      name: '1 Account Standard',
      registration: 5000,
      daily: 1000,
      total: 365000,
      settlement: 500000,
      popular: true,
      description: 'Perfect for getting started with consistent savings'
    },
    {
      id: '2-account',
      name: '2 Accounts Standard',
      registration: 10000,
      daily: 2000,
      total: 730000,
      settlement: 1000000,
      popular: false,
      description: 'Double your savings potential with dual accounts'
    },
    {
      id: '3-account',
      name: '3 Accounts Standard',
      registration: 15000,
      daily: 3000,
      total: 1095000,
      settlement: 1500000,
      popular: false,
      description: 'Triple your returns with enhanced savings'
    },
    {
      id: '4-account',
      name: '4 Accounts Standard',
      registration: 20000,
      daily: 4000,
      total: 1460000,
      settlement: 2000000,
      popular: false,
      description: 'Maximize your earnings with four accounts'
    },
    {
      id: '5-account',
      name: '5 Accounts Standard',
      registration: 25000,
      daily: 5000,
      total: 1825000,
      settlement: 2500000,
      popular: false,
      description: 'Ultimate savings plan for serious investors'
    }
  ];

  const otherPlans = [
    {
      id: 'medium',
      name: 'Medium Plan',
      registration: 5000,
      daily: 500,
      total: 182500,
      settlement: 250000,
      popular: false,
      description: 'Moderate savings for steady growth'
    },
    {
      id: 'least',
      name: 'Least Plan',
      registration: 5000,
      daily: 250,
      total: 91250,
      settlement: 125000,
      popular: false,
      description: 'Start small and build your savings habit'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleProceed = () => {
    if (selectedPlan) {
      // Redirect to payment or dashboard
      navigate('/dashboard');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const calculateReturn = (settlement: number, total: number) => {
    return Math.round(((settlement - total) / total) * 100);
  };

  const PlanCard = ({ plan, isSelected, onSelect }: any) => (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
        isSelected 
          ? 'border-green-500 ring-2 ring-green-500 ring-opacity-20' 
          : plan.popular
          ? 'border-green-500'
          : 'border-gray-100 hover:border-green-200'
      }`}
      onClick={() => onSelect(plan.id)}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
            <Star className="h-4 w-4 mr-1" />
            Most Popular
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
          {isSelected && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Registration Fee:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(plan.registration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Daily Contribution:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(plan.daily)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Contributions:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(plan.total)}</span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-green-600 font-medium">Final Settlement:</span>
            <span className="font-bold text-green-600 text-lg">{formatCurrency(plan.settlement)}</span>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-center">
              <span className="text-green-800 font-semibold">
                {calculateReturn(plan.settlement, plan.total)}% Return
              </span>
              <p className="text-xs text-green-600 mt-1">
                Earn {formatCurrency(plan.settlement - plan.total)} profit in 12 months
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
              Proven Value Enterprise
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Savings Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the plan that best fits your savings goals. All plans run for 12 months with automated daily contributions.
          </p>
        </div>

        {/* Standard Plans */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Standard Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {standardPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
        </section>

        {/* Other Plans */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Starter Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {otherPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
        </section>

        {/* Mega Plan Notice */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Need More Than 5 Accounts?</h3>
            <p className="text-lg mb-6 text-purple-100">
              Our Mega Plan offers unlimited accounts with custom terms tailored to your investment goals.
            </p>
            <Link
              to="/login"
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors duration-200 inline-block"
            >
              Contact Us for Mega Plan
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">What's Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Automated Savings</h4>
                <p className="text-sm text-gray-600">Daily contributions deducted automatically at 12:00 AM</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Virtual Account</h4>
                <p className="text-sm text-gray-600">Dedicated virtual account for easy funding</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Referral Rewards</h4>
                <p className="text-sm text-gray-600">Earn ₦5,000 for each successful referral</p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="text-center">
          {selectedPlan ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                Great choice! Ready to start your savings journey?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleProceed}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300"
                >
                  Proceed with Selected Plan
                </button>
                <Link
                  to="/register"
                  className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
                >
                  Create Account First
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-600 mb-6">
                Select a plan above to get started
              </p>
              <Link
                to="/login"
                className="text-green-600 hover:text-green-500 font-medium transition-colors duration-200"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;