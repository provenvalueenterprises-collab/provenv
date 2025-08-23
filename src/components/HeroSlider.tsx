import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Shield, Users, Wallet, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "MAKE SAVING YOUR DAILY HABIT",
      subtitle: "Join thousands of Nigerians building wealth through automated daily contributions",
      image: "https://images.pexels.com/photos/3483098/pexels-photo-3483098.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      icon: TrendingUp,
      color: "from-primary-500 to-secondary-600",
      accent: "from-primary-400 to-secondary-500"
    },
    {
      id: 2,
      title: "SECURE & AUTOMATED SAVINGS",
      subtitle: "Your contributions are automatically deducted daily with bank-level security",
      image: "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      icon: Shield,
      color: "from-secondary-500 to-accent-600",
      accent: "from-secondary-400 to-accent-500"
    },
    {
      id: 3,
      title: "EARN THROUGH REFERRALS",
      subtitle: "Get ₦5,000 for each referral and unlock Fast Track with 10+ referrals",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      icon: Users,
      color: "from-accent-500 to-primary-600",
      accent: "from-accent-400 to-primary-500"
    },
    {
      id: 4,
      title: "VIRTUAL ACCOUNT FUNDING",
      subtitle: "Get your dedicated virtual account for seamless wallet funding",
      image: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      icon: Wallet,
      color: "from-primary-500 to-secondary-600",
      accent: "from-primary-400 to-secondary-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1, rotateY: 10 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                className="mb-8"
              >
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${slides[currentSlide].color} mb-6 shadow-2xl animate-glow floating-animation`}>
                  {React.createElement(slides[currentSlide].icon, { className: "h-10 w-10 text-white" })}
                </div>
              </motion.div>

              <motion.h1
                initial={{ y: 100, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight"
              >
                <span className="relative">
                  {slides[currentSlide].title}
                  <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].accent} bg-clip-text text-transparent animate-pulse-slow`}>
                    {slides[currentSlide].title}
                  </div>
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                className="text-xl md:text-3xl text-gray-100 mb-12 max-w-5xl mx-auto leading-relaxed font-light"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.08, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/register"
                    className={`inline-flex items-center bg-gradient-to-r ${slides[currentSlide].color} text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 animate-glow`}
                  >
                    <Sparkles className="h-6 w-6 mr-3" />
                    Start Saving Today
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.08, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/plans"
                    className="inline-flex items-center glass-effect border-2 border-white/30 text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-500"
                  >
                    <Play className="h-6 w-6 mr-3" />
                    Learn More
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <motion.button
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 glass-effect text-white p-4 rounded-full hover:bg-white/20 transition-all duration-300 group"
      >
        <ChevronLeft className="h-7 w-7 group-hover:text-primary-300 transition-colors duration-300" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={nextSlide}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 glass-effect text-white p-4 rounded-full hover:bg-white/20 transition-all duration-300 group"
      >
        <ChevronRight className="h-7 w-7 group-hover:text-primary-300 transition-colors duration-300" />
      </motion.button>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex space-x-4">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-500 ${
              index === currentSlide
                ? `bg-gradient-to-r ${slides[currentSlide].color} scale-125 shadow-lg animate-glow`
                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
            }`}
          />
        ))}
      </div>

      {/* Floating Stats */}
      <motion.div
        initial={{ opacity: 0, y: 100, x: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
        className="absolute bottom-24 left-8 z-20 hidden lg:block"
      >
        <div className="glass-effect rounded-2xl p-6 text-white floating-animation">
          <div className="text-4xl font-bold gradient-text mb-2">2,850+</div>
          <div className="text-sm text-white/80 font-medium">Active Savers</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 100, x: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
        className="absolute bottom-24 right-8 z-20 hidden lg:block"
      >
        <div className="glass-effect rounded-2xl p-6 text-white floating-animation" style={{ animationDelay: '1s' }}>
          <div className="text-4xl font-bold gradient-text mb-2">₦45M+</div>
          <div className="text-sm text-white/80 font-medium">Total Saved</div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 hidden md:block"
      >
        <div className="flex flex-col items-center text-white/60">
          <div className="text-xs font-medium mb-2">Scroll to explore</div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSlider;