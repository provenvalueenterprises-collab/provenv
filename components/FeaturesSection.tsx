import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Truck, Users, TrendingUp, Heart, MapPin, Bell, Target, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Food Security Guarantee",
      description: "Ensure your family never goes hungry with our reliable food supply network and community support system",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Truck,
      title: "Direct Food Distribution",
      description: "Get fresh food and household essentials delivered directly to your community through our trusted network",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Community Food Network",
      description: "Connect with local families and food suppliers to build a sustainable community food support system",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Affordable Food Access",
      description: "Access quality food and essentials at reduced prices through our collective buying power and partnerships",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Heart,
      title: "Family Support Programs",
      description: "Join programs designed to support families in need while building strong community bonds and mutual aid",
      color: "from-teal-500 to-blue-500"
    },
    {
      icon: MapPin,
      title: "Local Food Hubs",
      description: "Access nearby food distribution points and connect with local farmers and food suppliers in your area",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Bell,
      title: "Food Alert System",
      description: "Get notified about food distributions, emergency food aid, and community support opportunities",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Target,
      title: "Hunger Prevention",
      description: "Participate in proactive programs that prevent hunger before it happens through planning and preparation",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: BarChart3,
      title: "Impact Tracking",
      description: "Monitor how your participation helps families in your community overcome hunger and food insecurity",
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
            How We <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">End Hunger</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive food security network ensures no family goes hungry while building stronger communities through mutual support
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
            Join 1000+ Nigerians Overcoming Hunger & Building Food Security
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Be part of Nigeria&apos;s most impactful community food network ensuring no family goes hungry
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">5,000+</div>
              <div className="text-sm opacity-80">Families Fed</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">1,000+</div>
              <div className="text-sm opacity-80">Active Members</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">42+</div>
              <div className="text-sm opacity-80">Food Distributions</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
