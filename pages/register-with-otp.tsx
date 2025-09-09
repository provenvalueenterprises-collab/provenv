import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, UserPlus, MessageCircle, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import PhoneInput, { Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type RegistrationStep = 'form' | 'otp' | 'success';

const RegisterWithOTPPage = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '' as string | undefined,
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [otpData, setOtpData] = useState({
    otp: '',
    phoneNumber: '',
    loading: false,
    timeLeft: 0,
    canResend: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  React.useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // OTP Timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpData.timeLeft > 0) {
      interval = setInterval(() => {
        setOtpData(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          return {
            ...prev,
            timeLeft: newTimeLeft,
            canResend: newTimeLeft === 0
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpData.timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    // For phone registration with OTP
    const hasPhone = formData.phone && formData.phone.trim();
    const hasEmail = formData.email && formData.email.trim();

    if (!hasPhone && !hasEmail) {
      setError('Please provide either a phone number or email address');
      return;
    }

    // If phone is provided, use OTP verification
    if (hasPhone) {
      if (!formData.phone!.startsWith('+')) {
        setError('Please select your country and enter a valid phone number');
        return;
      }
      await sendOTP();
    } else {
      // Email-only registration (no OTP)
      await registerWithoutOTP();
    }
  };

  const sendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          referral_code: formData.referralCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send verification code');
        return;
      }

      setOtpData({
        otp: '',
        phoneNumber: formData.phone || '',
        loading: false,
        timeLeft: 600, // 10 minutes
        canResend: false
      });

      setCurrentStep('otp');
      setSuccess('Verification code sent to your phone number!');
    } catch (err: any) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpData.otp || otpData.otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setOtpData(prev => ({ ...prev, loading: true }));
    setError('');

    try {
      const response = await fetch('/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: otpData.phoneNumber,
          otp: otpData.otp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid verification code');
        return;
      }

      setCurrentStep('success');
      setSuccess('Account created successfully! Redirecting to login...');

      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?message=Account created successfully, please login');
      }, 2000);

    } catch (err: any) {
      setError('Verification failed. Please try again.');
    } finally {
      setOtpData(prev => ({ ...prev, loading: false }));
    }
  };

  const registerWithoutOTP = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          referral_code: formData.referralCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      // Registration successful - automatically log in the user
      try {
        const loginIdentifier = formData.phone || formData.email;
        
        const result = await signIn('credentials', {
          identifier: loginIdentifier,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login?message=Registration successful, please login');
        }
      } catch (loginError) {
        router.push('/login?message=Registration successful, please login');
      }
    } catch (err: any) {
      setError((err instanceof Error ? err.message : String(err)) || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    await sendOTP();
  };

  const goBackToForm = () => {
    setCurrentStep('form');
    setOtpData({
      otp: '',
      phoneNumber: '',
      loading: false,
      timeLeft: 0,
      canResend: false
    });
    setError('');
    setSuccess('');
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
      phone: value || ''
    }));
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpData(prev => ({ ...prev, otp: value }));
  };

  // Form Step
  if (currentStep === 'form') {
    return (
      <>
        <style jsx global>{`
          .PhoneInput {
            width: 100%;
          }
          .PhoneInputInput {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px 16px;
            color: white;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .PhoneInputInput:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: rgba(255, 255, 255, 0.08);
          }
          .PhoneInputCountrySelect {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px 0 0 12px;
            color: white;
          }
          .PhoneInputCountrySelectArrow {
            color: rgba(255, 255, 255, 0.7);
          }
        `}</style>
        
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-300">Join PROVENV and start your financial journey</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
                <p className="text-green-200 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number (Recommended)
                </label>
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  className="phone-input"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Phone verification provides better security
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address (Optional if phone provided)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                  placeholder="Enter referral code"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // OTP Verification Step
  if (currentStep === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-400 to-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Phone</h1>
            <p className="text-gray-300">
              Enter the 6-digit code sent to<br />
              <span className="font-medium text-white">{otpData.phoneNumber}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otpData.otp}
                onChange={handleOTPChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <button
              onClick={verifyOTP}
              disabled={otpData.loading || otpData.otp.length !== 6}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {otpData.loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Verify Code</span>
                </>
              )}
            </button>

            <div className="text-center">
              {otpData.timeLeft > 0 ? (
                <p className="text-gray-300">
                  Resend code in{' '}
                  <span className="font-mono text-blue-400">{formatTime(otpData.timeLeft)}</span>
                </p>
              ) : (
                <button
                  onClick={resendOTP}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Resend verification code
                </button>
              )}
            </div>

            <button
              onClick={goBackToForm}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Back to Registration</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20 text-center">
        <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Account Created!</h1>
        <p className="text-gray-300 mb-6">
          Your account has been successfully created and your phone number is verified.
        </p>
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-200 text-sm">{success}</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterWithOTPPage;
