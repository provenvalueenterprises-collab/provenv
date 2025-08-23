@@ .. @@
+import React, { useState } from 'react';
+import Link from 'next/link';
+import { useRouter } from 'next/navigation';
+import { useAuth } from '../../contexts/AuthContext';
+import { Eye, EyeOff, UserPlus, Sparkles, Gift, ArrowLeft, CheckCircle } from 'lucide-react';
+import { motion } from 'framer-motion';
+
+const RegisterPage = () => {
+  const [formData, setFormData] = useState({
+    name: '',
+    email: '',
+    phone: '',
+    password: '',
+    confirmPassword: '',
+    referralCode: ''
+  });
+  const [showPassword, setShowPassword] = useState(false);
+  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
+  const [loading, setLoading] = useState(false);
+  const [error, setError] = useState('');
+
+  const { register } = useAuth();
+  const router = useRouter();
+
+  const handleSubmit = async (e: React.FormEvent) => {
+    e.preventDefault();
+    setError('');
+
+    if (formData.password !== formData.confirmPassword) {
+      setError('Passwords do not match');
+      return;
+    }
+
+    if (formData.password.length < 6) {
+      setError('Password must be at least 6 characters');
+      return;
+    }
+
+    setLoading(true);
+
+    try {
+      await register({
+        name: formData.name,
+        email: formData.email,
+        phone: formData.phone,
+        password: formData.password,
+        referral_code: formData.referralCode
+      });
+      router.push('/plans');
+    } catch (err) {
+      setError('Registration failed. Please try again.');
+    } finally {
+      setLoading(false);
+    }
+  };
+
+  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
+    setFormData({
+      ...formData,
+      [e.target.name]: e.target.value
+    });
+  };
+
+  const benefits = [
+    "Free account setup",
+    "Instant virtual account",
+    "₦5,000 per referral",
+    "24/7 support"
+  ];
+
+  return (
+    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
+      {/* Background decoration */}
+      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 via-secondary-100/30 to-accent-100/30"></div>
+      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-accent-200/40 to-transparent rounded-full blur-3xl"></div>
+      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary-200/40 to-transparent rounded-full blur-3xl"></div>
+      
+      <motion.div 
+        initial={{ opacity: 0, y: 50 }}
+        animate={{ opacity: 1, y: 0 }}
+        transition={{ duration: 0.8, ease: "easeOut" }}
+        className="max-w-md w-full space-y-8 relative z-10"
+      >
+        {/* Header */}
+        <motion.div 
+          initial={{ opacity: 0, y: 30 }}
+          animate={{ opacity: 1, y: 0 }}
+          transition={{ duration: 0.8, delay: 0.2 }}
+          className="text-center"
+        >
+          <div className="flex items-center justify-center mb-6">
+            <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-4 shadow-xl animate-glow">
+              <Sparkles className="h-8 w-8 text-white" />
+            </div>
+          </div>
+          <h1 className="text-4xl font-bold gradient-text mb-3">
+            Proven Value
+          </h1>
+          <h2 className="text-3xl font-bold text-gray-900 mb-3">
+            Create Your Account
+          </h2>
+          <p className="text-gray-600 text-lg">
+            Start your journey to financial freedom today
+          </p>
+        </motion.div>
+
+        {/* Benefits Banner */}
+        <motion.div 
+          initial={{ opacity: 0, scale: 0.9 }}
+          animate={{ opacity: 1, scale: 1 }}
+          transition={{ duration: 0.8, delay: 0.3 }}
+          className="glass-effect rounded-2xl p-4 border border-primary-200/50"
+        >
+          <div className="flex items-center mb-3">
+            <Gift className="h-5 w-5 text-primary-600 mr-2" />
+            <span className="text-sm font-bold text-primary-800">Join & Get Benefits</span>
+          </div>
+          <div className="grid grid-cols-2 gap-2">
+            {benefits.map((benefit, index) => (
+              <motion.div 
+                key={index}
+                initial={{ opacity: 0, x: -20 }}
+                animate={{ opacity: 1, x: 0 }}
+                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
+                className="flex items-center text-xs"
+              >
+                <CheckCircle className="h-3 w-3 text-primary-500 mr-1" />
+                <span className="text-gray-700 font-medium">{benefit}</span>
+              </motion.div>
+            ))}
+          </div>
+        </motion.div>
+
+        {/* Form */}
+        <motion.form 
+          initial={{ opacity: 0, y: 30 }}
+          animate={{ opacity: 1, y: 0 }}
+          transition={{ duration: 0.8, delay: 0.4 }}
+          className="glass-effect rounded-3xl p-8 space-y-6 shadow-2xl" 
+          onSubmit={handleSubmit}
+        >
+          {error && (
+            <motion.div 
+              initial={{ opacity: 0, scale: 0.9 }}
+              animate={{ opacity: 1, scale: 1 }}
+              className="bg-red-50 border border-red-200 rounded-xl p-4"
+            >
+              <p className="text-red-600 text-sm font-medium">{error}</p>
+            </motion.div>
+          )}
+
+          <div className="grid grid-cols-1 gap-6">
+            <div>
+              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
+                Full Name
+              </label>
+              <motion.input
+                whileFocus={{ scale: 1.02 }}
+                transition={{ duration: 0.2 }}
+                id="name"
+                name="name"
+                type="text"
+                required
+                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
+                placeholder="Enter your full name"
+                value={formData.name}
+                onChange={handleChange}
+              />
+            </div>
+
+            <div>
+              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
+                Email Address
+              </label>
+              <motion.input
+                whileFocus={{ scale: 1.02 }}
+                transition={{ duration: 0.2 }}
+                id="email"
+                name="email"
+                type="email"
+                required
+                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
+                placeholder="Enter your email"
+                value={formData.email}
+                onChange={handleChange}
+              />
+            </div>
+
+            <div>
+              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
+                Phone Number
+              </label>
+              <motion.input
+                whileFocus={{ scale: 1.02 }}
+                transition={{ duration: 0.2 }}
+                id="phone"
+                name="phone"
+                type="tel"
+                required
+                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
+                placeholder="08XXXXXXXXX"
+                value={formData.phone}
+                onChange={handleChange}
+              />
+            </div>
+
+            <div>
+              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
+                Password
+              </label>
+              <div className="relative">
+                <motion.input
+                  whileFocus={{ scale: 1.02 }}
+                  transition={{ duration: 0.2 }}
+                  id="password"
+                  name="password"
+                  type={showPassword ? 'text' : 'password'}
+                  required
+                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
+                  placeholder="Create a password"
+                  value={formData.password}
+                  onChange={handleChange}
+                />
+                <motion.button
+                  whileHover={{ scale: 1.1 }}
+                  whileTap={{ scale: 0.9 }}
+                  type="button"
+                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors duration-200"
+                  onClick={() => setShowPassword(!showPassword)}
+                >
+                  {showPassword ? (
+                    <EyeOff className="h-5 w-5" />
+                  ) : (
+                    <Eye className="h-5 w-5" />
+                  )}
+                </motion.button>
+              </div>
+            </div>
+
+            <div>
+              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
+                Confirm Password
+              </label>
+              <div className="relative">
+                <motion.input
+                  whileFocus={{ scale: 1.02 }}
+                  transition={{ duration: 0.2 }}
+                  id="confirmPassword"
+                  name="confirmPassword"
+                  type={showConfirmPassword ? 'text' : 'password'}
+                  required
+                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
+                  placeholder="Confirm your password"
+                  value={formData.confirmPassword}
+                  onChange={handleChange}
+                />
+                <motion.button
+                  whileHover={{ scale: 1.1 }}
+                  whileTap={{ scale: 0.9 }}
+                  type="button"
+                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors duration-200"
+                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
+                >
+                  {showConfirmPassword ? (
+                    <EyeOff className="h-5 w-5" />
+                  ) : (
+                    <Eye className="h-5 w-5" />
+                  )}
+                </motion.button>
+              </div>
+            </div>
+
+            <div>
+              <label htmlFor="referralCode" className="block text-sm font-semibold text-gray-700 mb-2">
+                <span className="flex items-center">
+                  Referral Code (Optional)
+                  <Gift className="h-4 w-4 ml-1 text-accent-500" />
+                </span>
+              </label>
+              <motion.input
+                whileFocus={{ scale: 1.02 }}
+                transition={{ duration: 0.2 }}
+                id="referralCode"
+                name="referralCode"
+                type="text"
+                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
+                placeholder="Enter referral code"
+                value={formData.referralCode}
+                onChange={handleChange}
+              />
+              <p className="text-xs text-accent-600 mt-1 font-medium">Get ₦5,000 bonus when you refer others!</p>
+            </div>
+          </div>
+
+          <motion.button
+            whileHover={{ scale: 1.02, y: -2 }}
+            whileTap={{ scale: 0.98 }}
+            type="submit"
+            disabled={loading}
+            className="w-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center animate-glow"
+          >
+            {loading ? (
+              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
+            ) : (
+              <>
+                <UserPlus className="h-6 w-6 mr-3" />
+                Create Account
+              </>
+            )}
+          </motion.button>
+
+          <div className="text-center pt-4">
+            <p className="text-sm text-gray-600">
+              Already have an account?{' '}
+              <motion.span whileHover={{ scale: 1.05 }}>
+                <Link
+                  href="/login"
+                  className="font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-200"
+                >
+                  Sign in here
+                </Link>
+              </motion.span>
+            </p>
+          </div>
+
+          <div className="text-center border-t pt-6">
+            <motion.span whileHover={{ scale: 1.05 }}>
+              <Link
+                href="/"
+                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 font-medium"
+              >
+                <ArrowLeft className="h-4 w-4 mr-2" />
+                Back to Home
+              </Link>
+            </motion.span>
+          </div>
+        </motion.form>
+      </motion.div>
+    </div>
+  );
+};
+
+export default RegisterPage;