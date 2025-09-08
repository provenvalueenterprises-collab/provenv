import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Heart, Target, Award, Lightbulb } from 'lucide-react';

const CoreValuesSection = () => {
  const values = [
    {
      icon: Heart,
      title: "Food Security First",
      description: "Ensuring our members never run out of food and essentials. We prioritize household stability and access to daily necessities above all else.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Target,
      title: "Discipline & Savings",
      description: "Training members to save a little daily and gain much more. We teach the discipline of consistent contribution for long-term stability.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Community Empowerment",
      description: "A system where everyone wins together. We build strong networks where members support each other and grow collectively.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Transparency & Trust",
      description: "Clear processes, no hidden practices. We maintain complete transparency in our operations so members can trust and participate with confidence.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Award,
      title: "Member Support",
      description: "We provide continuous support to ensure every member succeeds in building their food security and saving habits.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Lightbulb,
      title: "Community Education",
      description: "Empowering members with knowledge about food security, household management, and sustainable saving practices.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Our <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Values</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            The principles that guide our food network community, ensuring every family has access to essentials and builds lasting security
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-8 group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <value.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {value.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Promise</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              At ProvenValue, we don&apos;t just provide financial services—we build lasting relationships based on trust,
              transparency, and mutual success. Every decision we make is guided by these core values, ensuring that
              our platform remains a beacon of integrity in Nigeria&apos;s financial landscape.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CoreValuesSection;
