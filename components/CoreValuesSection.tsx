import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Heart, Target, Award, Lightbulb } from 'lucide-react';

const CoreValuesSection = () => {
  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We build trust through complete transparency in our operations and financial practices, ensuring every member understands how their funds are managed and protected.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Community First",
      description: "Our success is measured by the success of our community. We prioritize member satisfaction, support, and long-term financial well-being above all else.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "Integrity & Ethics",
      description: "We conduct business with unwavering integrity, maintaining the highest ethical standards in all our dealings and operations.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Innovation & Excellence",
      description: "We continuously innovate to provide the best financial solutions while maintaining excellence in every aspect of our service delivery.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Award,
      title: "Accountability",
      description: "We take full responsibility for our actions and decisions, ensuring that every member receives fair treatment and excellent service.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Lightbulb,
      title: "Financial Education",
      description: "We empower our members with knowledge and tools to make informed financial decisions that lead to long-term prosperity.",
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
            Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Core Values</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            The principles that guide everything we do at ProvenValue, ensuring we deliver exceptional value to our community
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
