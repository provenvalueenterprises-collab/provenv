import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Clock, TrendingUp, Users, Wallet, Bell, Lock, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your money and data are protected with enterprise-grade encryption and security protocols",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Seamless experience across all devices with our intuitive mobile app and web platform",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Automated Savings",
      description: "Set it and forget it - our system automatically handles your daily thrift contributions",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Competitive Returns",
      description: "Earn attractive returns on your savings with our transparent and competitive rate structure",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Referral Rewards",
      description: "Earn bonus income by referring friends and family to join the ProvenValue community",
      color: "from-teal-500 to-blue-500"
    },
    {
      icon: Wallet,
      title: "Flexible Withdrawals",
      description: "Access your funds when you need them with our flexible withdrawal options and emergency fund feature",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay informed with real-time notifications about contributions, rewards, and account activities",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Lock,
      title: "Goal Setting & Tracking",
      description: "Set financial goals and track your progress with detailed analytics and insights",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Monitor your savings progress with comprehensive reports and financial insights",
      color: "from-cyan-500 to-teal-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Powerful <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to build wealth systematically with cutting-edge technology and user-friendly features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-4">
            Join Over 10,000+ Nigerians Building Wealth
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Start your financial journey today with Nigeria&apos;s most trusted automated thrift platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">₦2.5B+</div>
              <div className="text-sm opacity-80">Total Savings</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-sm opacity-80">Active Users</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm opacity-80">Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
