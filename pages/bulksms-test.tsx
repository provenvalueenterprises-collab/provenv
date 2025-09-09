import React, { useState } from 'react';
import { Shield, MessageCircle, Phone, Send, CheckCircle, XCircle } from 'lucide-react';
import PhoneInput, { Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const BulkSMSTestPage = () => {
  const [testData, setTestData] = useState({
    phoneNumber: '' as string | undefined,
    message: '',
    otp: ''
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, message: string, data?: any) => {
    setResults(prev => [{
      test,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  const testSendOTP = async () => {
    if (!testData.phoneNumber) {
      addResult('Send OTP', false, 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testData.phoneNumber,
          name: 'Test User',
          password: 'test123456'
        })
      });

      const data = await response.json();
      addResult('Send Registration OTP', response.ok, data.message || 'Unknown response', data);
    } catch (error: any) {
      addResult('Send Registration OTP', false, error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const testVerifyOTP = async () => {
    if (!testData.phoneNumber || !testData.otp) {
      addResult('Verify OTP', false, 'Please enter phone number and OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testData.phoneNumber,
          otp: testData.otp
        })
      });

      const data = await response.json();
      addResult('Verify Registration OTP', response.ok, data.message || 'Unknown response', data);
    } catch (error: any) {
      addResult('Verify Registration OTP', false, error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const testPasswordResetOTP = async () => {
    if (!testData.phoneNumber) {
      addResult('Password Reset OTP', false, 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'phone',
          identifier: testData.phoneNumber
        })
      });

      const data = await response.json();
      addResult('Send Password Reset OTP', response.ok, data.message || 'Unknown response', data);
    } catch (error: any) {
      addResult('Send Password Reset OTP', false, error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const testCustomSMS = async () => {
    if (!testData.phoneNumber || !testData.message) {
      addResult('Custom SMS', false, 'Please enter phone number and message');
      return;
    }

    setLoading(true);
    try {
      // This would need a custom API endpoint for testing
      addResult('Custom SMS', false, 'Custom SMS endpoint not implemented (would need /api/test/send-sms)');
    } catch (error: any) {
      addResult('Custom SMS', false, error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

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

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">BulkSMSNigeria Test</h1>
            <p className="text-gray-300">Test SMS and OTP functionality</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Controls */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Phone className="w-6 h-6 mr-2" />
                Test Controls
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number (Nigerian)
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="NG"
                    value={testData.phoneNumber}
                    onChange={(value: Value) => setTestData(prev => ({ ...prev, phoneNumber: value || '' }))}
                    placeholder="Enter Nigerian phone number"
                    className="phone-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    OTP Code (for verification tests)
                  </label>
                  <input
                    type="text"
                    value={testData.otp}
                    onChange={(e) => setTestData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Message (for SMS test)
                  </label>
                  <textarea
                    value={testData.message}
                    onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all h-20"
                    placeholder="Enter custom SMS message"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={testSendOTP}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Send Registration OTP</span>
                  </button>

                  <button
                    onClick={testVerifyOTP}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Registration OTP</span>
                  </button>

                  <button
                    onClick={testPasswordResetOTP}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Send Password Reset OTP</span>
                  </button>

                  <button
                    onClick={testCustomSMS}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Custom SMS</span>
                  </button>

                  <button
                    onClick={clearResults}
                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Test Results</h2>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No tests run yet. Use the controls on the left to test functionality.
                  </div>
                ) : (
                  results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.success
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-red-500/20 border-red-500/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-medium text-white">{result.test}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={`text-sm ${result.success ? 'text-green-200' : 'text-red-200'}`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <pre className="text-xs text-gray-300 mt-2 bg-black/20 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Environment Info */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Environment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">API Token Configured:</span>
                <span className="ml-2 text-white">
                  {process.env.BULKSMS_API_TOKEN ? '✅ Yes' : '❌ No (Development Mode)'}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Sender ID:</span>
                <span className="ml-2 text-white">
                  {process.env.BULKSMS_SENDER_ID || 'PROVENV (Default)'}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <p className="text-blue-200 text-sm">
                💡 <strong>Development Mode:</strong> When API token is not configured, SMS sending is simulated and OTP codes are logged to the console.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkSMSTestPage;
