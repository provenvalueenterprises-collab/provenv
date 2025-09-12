import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import AboutUsSection from '../components/AboutUsSection';
import CoreValuesSection from '../components/CoreValuesSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TestimonialsSection from '../components/TestimonialsSection';
import TeamShowcase from '../components/TeamShowcase';
import ContactSection from '../components/ContactSection';
import { Phone, Mail, MapPin } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar transparent={true} />

      {/* Hero Section with Slider */}
      <HeroSlider />

      {/* About Us Section */}
      <AboutUsSection />

      {/* Core Values Section */}
      <CoreValuesSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Team Showcase */}
      <TeamShowcase />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Proven Value Enterprise</h3>
              <p className="text-gray-400 mb-6">
                Building food security for Nigerian families through community support and disciplined daily saving habits.
              </p>
              <div className="flex space-x-4">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">+234 816 135 7294</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/plans" className="text-gray-400 hover:text-white block transition-colors">Plans</Link>
                <Link href="/register" className="text-gray-400 hover:text-white block transition-colors">Register</Link>
                <Link href="/login" className="text-gray-400 hover:text-white block transition-colors">Login</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="/terms" className="text-gray-400 hover:text-white block transition-colors">Terms & Conditions</Link>
                <Link href="/contact" className="text-gray-400 hover:text-white block transition-colors">Contact Us</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-400">support@provenvalueenterprise.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-400">No 1 Ibeh Road, Okota, Lagos, Nigeria</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Proven Value Enterprise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
