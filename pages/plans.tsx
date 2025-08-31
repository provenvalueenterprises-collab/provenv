import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, Check, ArrowRight } from 'lucide-react';

const PlansPage = () => {
  const plans = [
    {
      name: "Basic Thrift",
      duration: "30 days",
      minAmount: 500,
      description: "Perfect for beginners looking to start their savings journey",
      features: ["Daily contributions", "Automated savings", "Basic support", "Secure wallet"],
      color: "from-blue-500 to-cyan-600",
      recommended: false
    },
    {
      name: "Standard Thrift", 
      duration: "60 days",
      minAmount: 1000,
      description: "Great for consistent savers building wealth steadily",
      features: ["Daily contributions", "Automated savings", "Priority support", "Referral bonus", "Virtual account"],
      color: "from-purple-500 to-pink-600",
      recommended: true
    },
    {
      name: "Premium Thrift",
      duration: "90 days", 
      minAmount: 2000,
      description: "For serious savers committed to long-term wealth building",
      features: ["Daily contributions", "Automated savings", "VIP support", "Referral bonus", "Fast track eligible", "Premium rewards"],
      color: "from-emerald-500 to-teal-600",
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary-600">ProvenValue</h1>
            </Link>
            <div className="flex space-x-4">
              <Link href="/login">
                <button className="text-gray-600 hover:text-gray-900 px-4 py-2">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-lg hover:from-primary-700 hover:to-secondary-700">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Choose Your <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Thrift Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect savings plan that matches your financial goals and commitment level. All plans include automated daily contributions and secure fund management.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-3xl shadow-xl p-8 ${plan.recommended ? 'ring-4 ring-purple-500 transform scale-105' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ₦{plan.minAmount.toLocaleString()}+
                  </div>
                  <div className="text-gray-500">{plan.duration} commitment</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full bg-gradient-to-r ${plan.color} text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center`}
                  >
                    Choose Plan
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="bg-gradient-to-r from-primary-100 to-secondary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-primary-600 font-bold text-lg">1</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Choose Your Plan</h4>
                  <p className="text-gray-600">Select a thrift plan that matches your savings goal and duration preference.</p>
                </div>
                <div>
                  <div className="bg-gradient-to-r from-primary-100 to-secondary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-primary-600 font-bold text-lg">2</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Set Up Auto-Debit</h4>
                  <p className="text-gray-600">Link your bank account for automated daily contributions to your thrift.</p>
                </div>
                <div>
                  <div className="bg-gradient-to-r from-primary-100 to-secondary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-primary-600 font-bold text-lg">3</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Watch Your Savings Grow</h4>
                  <p className="text-gray-600">Track your progress and receive your full savings at the end of the cycle.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 mb-6">
              Need help choosing the right plan for you?
            </p>
            <Link href="/contact">
              <button className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors">
                Contact Our Team
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PlansPage;
