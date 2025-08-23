import React from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Wallet, 
  Phone, 
  Mail, 
  MapPin,
  Check,
  Star,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const plans = [
    {
      name: "Least Plan",
      registration: "₦5,000",
      daily: "₦250",
      total: "₦91,250",
      settlement: "₦125,000",
      popular: false
    },
    {
      name: "Medium Plan",
      registration: "₦5,000",
      daily: "₦500",
      total: "₦182,500",
      settlement: "₦250,000",
      popular: false
    },
    {
      name: "1 Account Standard",
      registration: "₦5,000",
      daily: "₦1,000",
      total: "₦365,000",
      settlement: "₦500,000",
      popular: true
    },
    {
      name: "2 Accounts Standard",
      registration: "₦10,000",
      daily: "₦2,000",
      total: "₦730,000",
      settlement: "₦1,000,000",
      popular: false
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Automated Daily Savings",
      description: "Your contributions are automatically deducted at 12:00 AM daily from your wallet balance."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your funds are protected with bank-level security and automated fine enforcement for compliance."
    },
    {
      icon: Users,
      title: "Referral Rewards",
      description: "Earn ₦5,000 for each referral. Refer 10+ within 2 months to unlock Fast Track settlement."
    },
    {
      icon: Wallet,
      title: "Virtual Account",
      description: "Get your dedicated virtual account number for seamless funding via bank transfer."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                  Proven Value Enterprise
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSlider />

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Proven Value?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make saving simple, secure, and rewarding with features designed for your success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-white mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Plans Preview */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Contribution Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our flexible plans designed to help you save and earn more over 12 months.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-green-500 relative' : 'border-gray-100'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Popular
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration:</span>
                      <span className="font-semibold text-gray-900">{plan.registration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily:</span>
                      <span className="font-semibold text-gray-900">{plan.daily}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Saved:</span>
                      <span className="font-semibold text-gray-900">{plan.total}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-green-600 font-medium">Settlement:</span>
                      <span className="font-bold text-green-600 text-lg">{plan.settlement}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              to="/plans"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              View All Plans
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
                <p className="text-lg mb-8 text-green-50">
                  Have questions? Our team is here to help you start your savings journey.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3" />
                    <span>08161357294, 08062186594</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>contact@provenvalue.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>No 1 Ibeh Road, Okota, Lagos, Nigeria</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-xl font-semibold mb-6">Ready to Start Saving?</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-300" />
                    <span>Free registration process</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-300" />
                    <span>Instant virtual account setup</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-300" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-3 text-green-300" />
                    <span>Secure and regulated</span>
                  </div>
                </div>
                
                <Link
                  to="/register"
                  className="block w-full bg-white text-green-600 text-center px-6 py-3 rounded-xl font-semibold mt-6 hover:bg-green-50 transition-colors duration-200"
                >
                  Join Now - It's Free!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Proven Value Enterprise</h3>
            <p className="text-gray-400 mb-6">Making saving your daily habit</p>
            <p className="text-sm text-gray-500">
              Owner: Onu Blessing Rita | © 2025 Proven Value Enterprise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;