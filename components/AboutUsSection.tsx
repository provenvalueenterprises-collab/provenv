import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart, Users, TrendingUp } from 'lucide-react';

const AboutUsSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why Choose <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Us?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            At Proven Value Enterprise, we believe no family should go hungry. Our food network marketing model is designed to
            provide affordable access to food and household essentials while teaching consistent saving habits that guarantee 
            long-term stability. We support members with a community-driven platform where everyone grows together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  To help Nigerians overcome hunger and lack by combining the power of community food support with daily saving habits.
                  We ensure every family has access to food and household essentials while building financial discipline.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
                <p className="text-gray-600">
                  To see every home stocked with food, every family empowered, and every individual equipped with the 
                  discipline to save and never lack. A Nigeria where food security is guaranteed for all.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Community</h3>
                <p className="text-gray-600">
                  Join thousands of families who have secured their food supply through our community network.
                  Together, we build lasting saving habits while ensuring no one goes hungry.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-2xl"
          >
            <div className="text-center mb-8">
              <TrendingUp className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Impact So Far</h3>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
                <div className="text-gray-600">Families Supported</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">42+</div>
                <div className="text-gray-600">Community Events Hosted</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">11+</div>
                <div className="text-gray-600">Team Members Serving Nationwide</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
