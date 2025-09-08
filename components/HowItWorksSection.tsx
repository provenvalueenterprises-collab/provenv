import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CreditCard, TrendingUp, Gift, CheckCircle } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserPlus,
      step: "01",
      title: "Register as a Member",
      description: "Sign up and become part of our food network community. Join thousands of families building food security together.",
      details: ["Quick 3-minute registration", "Join our community network", "Access member benefits"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: CreditCard,
      step: "02", 
      title: "Support & Save Daily",
      description: "Contribute consistently to strengthen your wallet while supporting the community. Learn disciplined saving habits.",
      details: ["Daily contribution plans", "Build saving discipline", "Community support network"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      step: "03",
      title: "Access Food & Essentials",
      description: "Enjoy benefits that ensure your family never lacks. Access food and household essentials through our network.",
      details: ["Access to food supplies", "Household essentials", "Family security guaranteed"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Gift,
      step: "04",
      title: "Grow With Us",
      description: "Build lasting savings habits while keeping your household stable. Grow together as a community.",
      details: ["Long-term stability", "Community growth", "Sustained food security"],
      color: "from-orange-500 to-red-500"
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Community Support",
      description: "Join a network that cares about your family's food security"
    },
    {
      icon: CheckCircle,
      title: "Daily Discipline",
      description: "Build consistent saving habits that last"
    },
    {
      icon: CheckCircle,
      title: "Food Security",
      description: "Never worry about household essentials again"
    },
    {
      icon: CheckCircle,
      title: "Family Stability",
      description: "Ensure your loved ones always have what they need"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            How <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">It Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start building wealth in 4 simple steps. It&apos;s easier than you think!
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-32 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-primary-200 to-secondary-200"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  {/* Step Card */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative z-10">
                    {/* Step Number */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.step}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Why Choose ProvenValue?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100"
                >
                  <IconComponent className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Start Building Wealth?
            </h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of Nigerians who are already saving and earning with ProvenValue
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105">
                Get Started Now
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
