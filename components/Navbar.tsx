import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    if (transparent) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [transparent]);

  const navLinks = [
    { 
      label: 'Learn More',
      href: '#about',
      dropdown: [
        { label: 'About Us', href: '#about' },
        { label: 'Our Story', href: '#story' },
        { label: 'Mission & Vision', href: '#mission' }
      ]
    },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' }
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(href);
    }
    setIsMobileMenuOpen(false);
  };

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    transparent && !isScrolled
      ? 'bg-transparent'
      : 'bg-white/95 backdrop-blur-md shadow-lg'
  }`;

  const textClasses = `transition-colors duration-300 ${
    transparent && !isScrolled ? 'text-white' : 'text-gray-900'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/logo2.jpg" 
              alt="Proven Value Enterprise" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className={`font-bold text-xl ${textClasses}`}>
              ProvenValue
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <div key={index} className="relative">
                {link.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <button
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors hover:bg-primary-50 ${textClasses}`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                        {link.dropdown.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleNavClick(item.href)}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className={`px-3 py-2 rounded-lg transition-colors hover:bg-primary-50 ${textClasses}`}
                  >
                    {link.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/login"
              className={`px-4 py-2 rounded-lg transition-colors hover:bg-primary-50 ${textClasses}`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={`lg:hidden p-2 rounded-lg ${textClasses}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-6 border-t border-gray-200">
            <div className="pt-6 space-y-4">
              {navLinks.map((link, index) => (
                <div key={index}>
                  {link.dropdown ? (
                    <div>
                      <button
                        className="w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span className="flex items-center justify-between">
                          {link.label}
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>
                      {isDropdownOpen && (
                        <div className="ml-4 mt-2 space-y-2">
                          {link.dropdown.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNavClick(item.href)}
                              className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </button>
                  )}
                </div>
              ))}
              
              <div className="pt-4 space-y-2">
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
