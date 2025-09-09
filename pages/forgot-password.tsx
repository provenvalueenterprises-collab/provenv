import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Phone, Mail, ArrowLeft, Key, CheckCircle } from 'lucide-react';
import PhoneInput, { Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'method' | 'phone' | 'email' | 'otp' | 'reset' | 'success'>('method');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [formData, setFormData] = useState({
    phone: '' as string | undefined,
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();

  const handleSendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const identifier = method === 'phone' ? formData.phone : formData.email;
      
      if (!identifier) {
        setError(`Please enter your ${method === 'phone' ? 'phone number' : 'email address'}`);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/send-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          identifier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP');
        return;
      }

      setSuccessMessage(`OTP sent to your ${method === 'phone' ? 'phone number' : 'email address'}`);
      setOtpSent(true);
      setStep('otp');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const identifier = method === 'phone' ? formData.phone : formData.email;

      const response = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          identifier,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid OTP');
        return;
      }

      setSuccessMessage('OTP verified successfully');
      setStep('reset');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const identifier = method === 'phone' ? formData.phone : formData.email;

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          identifier,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password');
        return;
      }

      setStep('success');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhoneChange = (value: Value) => {
    setFormData(prev => ({
      ...prev,
      phone: value as string
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'success' ? 'Password Reset Successfully!' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {step === 'method' && 'Choose how you want to recover your password'}
              {step === 'phone' && 'Enter your phone number to receive an OTP'}
              {step === 'email' && 'Enter your email address to receive an OTP'}
              {step === 'otp' && `Enter the OTP sent to your ${method === 'phone' ? 'phone number' : 'email'}`}
              {step === 'reset' && 'Create your new password'}
              {step === 'success' && 'You can now login with your new password'}
            </p>
          </div>

          {/* Step 1: Choose Method */}
          {step === 'method' && (
            <div className="space-y-4">
              <div 
                onClick={() => {
                  setMethod('phone');
                  setStep('phone');
                }}
                className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone Number</h3>
                  <p className="text-sm text-gray-600">Send OTP to your registered phone</p>
                </div>
              </div>

              <div 
                onClick={() => {
                  setMethod('email');
                  setStep('email');
                }}
                className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Address</h3>
                  <p className="text-sm text-gray-600">Send OTP to your registered email</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Phone Input */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="NG"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || !formData.phone}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* Step 2: Email Input */}
          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your email address"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || !formData.email}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-6">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{successMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || formData.otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                Resend OTP
              </button>
            </div>
          )}

          {/* Step 4: Reset Password */}
          {step === 'reset' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading || !formData.newPassword || !formData.confirmPassword}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Password Reset Complete!
                </h3>
                <p className="text-gray-600">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
              </div>

              <Link
                href="/login"
                className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Back Button */}
          {step !== 'method' && step !== 'success' && (
            <button
              onClick={() => {
                if (step === 'phone' || step === 'email') setStep('method');
                else if (step === 'otp') setStep(method);
                else if (step === 'reset') setStep('otp');
              }}
              className="flex items-center justify-center w-full mt-6 text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          )}

          {/* Login Link */}
          {(step === 'method' || step === 'success') && (
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
