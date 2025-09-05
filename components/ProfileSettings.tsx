import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Shield, 
  Bell, 
  Lock, 
  CreditCard, 
  Smartphone,
  Mail,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface ProfileSettingsProps {
  profile: any;
  onUpdateProfile?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdateProfile }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleEmailVerification = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/profile/verify-email', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Verification email sent!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send verification email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending verification email' });
    } finally {
      setLoading(false);
    }
  };

  const settingsOptions = [
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Manage your account security and privacy',
      icon: <Shield className="h-5 w-5" />,
      action: () => console.log('Security settings'),
      enabled: true
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      description: 'Control how you receive updates and alerts',
      icon: <Bell className="h-5 w-5" />,
      action: () => console.log('Notification settings'),
      enabled: true
    },
    {
      id: 'privacy',
      title: 'Privacy Controls',
      description: 'Manage your data and privacy settings',
      icon: <Lock className="h-5 w-5" />,
      action: () => console.log('Privacy settings'),
      enabled: true
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      description: 'Manage your payment and withdrawal methods',
      icon: <CreditCard className="h-5 w-5" />,
      action: () => console.log('Payment settings'),
      enabled: true
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Settings className="h-5 w-5 mr-2 text-primary-600" />
        Account Settings
      </h2>

      {/* Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Email Verification */}
      {!profile?.emailVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Email Not Verified</h4>
                <p className="text-sm text-yellow-700">Please verify your email address to secure your account</p>
              </div>
            </div>
            <button
              onClick={handleEmailVerification}
              disabled={loading}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Sending...' : 'Send Verification'}
            </button>
          </div>
        </div>
      )}

      {/* Settings Options */}
      <div className="space-y-4">
        {settingsOptions.map((option) => (
          <div
            key={option.id}
            className={`border border-gray-200 rounded-lg p-4 transition-colors ${
              option.enabled 
                ? 'hover:bg-gray-50 cursor-pointer' 
                : 'bg-gray-50 cursor-not-allowed opacity-60'
            }`}
            onClick={option.enabled ? option.action : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-primary-600 mr-3">
                  {option.icon}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
              {option.enabled && (
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Account Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Account ID:</span>
            <p className="font-mono text-gray-900 break-all">{profile?.id}</p>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <p className="text-gray-900">
              {profile?.lastUpdated 
                ? new Date(profile.lastUpdated).toLocaleDateString() 
                : 'Never'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
