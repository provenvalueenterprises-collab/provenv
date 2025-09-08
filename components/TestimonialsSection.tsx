import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Joy Adebayo",
      location: "Lagos",
      message: "Since joining Proven Value Enterprise, I no longer worry about food in my house. My savings and the support I get here have kept my family secure.",
      rating: 5,
      image: "/images/testimonial1.jpg"
    },
    {
      id: 2,
      name: "Ibrahim Musa",
      location: "Abuja",
      message: "This platform taught me how to save little by little while still getting my daily needs. My household no longer lacks the basics.",
      rating: 5,
      image: "/images/testimonial2.jpg"
    },
    {
      id: 3,
      name: "Chioma Okafor",
      location: "Port Harcourt",
      message: "The community support is amazing. We help each other and ensure no family goes without food. This is more than savings - it's family.",
      rating: 5,
      image: "/images/testimonial3.jpg"
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
            What Our <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Members Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from families who have transformed their food security through our community
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <Quote className="w-8 h-8 text-green-500 mb-4" />
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                "{testimonial.message}"
              </p>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Join Our Community?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Start your journey to food security and financial discipline today
            </p>
            <button className="bg-white text-green-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300">
              Get Started Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
