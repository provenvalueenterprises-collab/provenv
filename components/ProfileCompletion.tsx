import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface UserProfile {
  displayName: string;
  email: string;
  phoneNumber?: string;
  emailVerified: boolean;
  virtualAccountNumber?: string;
  referralCode?: string;
}

interface ProfileCompletionProps {
  profile: UserProfile;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ profile }) => {
  const completionItems = [
    {
      id: 'display_name',
      label: 'Display Name',
      completed: !!profile.displayName,
      required: true
    },
    {
      id: 'email',
      label: 'Email Address',
      completed: !!profile.email,
      required: true
    },
    {
      id: 'email_verified',
      label: 'Email Verification',
      completed: profile.emailVerified,
      required: true
    },
    {
      id: 'phone',
      label: 'Phone Number',
      completed: !!profile.phoneNumber,
      required: true
    },
    {
      id: 'virtual_account',
      label: 'Virtual Account',
      completed: !!profile.virtualAccountNumber,
      required: false
    },
    {
      id: 'referral_code',
      label: 'Referral Code',
      completed: !!profile.referralCode,
      required: false
    }
  ];

  const requiredItems = completionItems.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed).length;
  const totalRequired = requiredItems.length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  const getStatusIcon = (completed: boolean, required: boolean) => {
    if (completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (required) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (completed: boolean, required: boolean) => {
    if (completed) return 'text-green-700';
    if (required) return 'text-red-700';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {completedRequired} of {totalRequired} required items completed
          </span>
          <span className="text-sm font-bold text-primary-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Completion Status */}
      {completionPercentage === 100 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Profile Complete! You're all set to use all features.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              Complete your profile to unlock all features
            </span>
          </div>
        </div>
      )}

      {/* Completion Items */}
      <div className="space-y-3">
        {completionItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(item.completed, item.required)}
              <span className={`ml-3 text-sm ${getStatusColor(item.completed, item.required)}`}>
                {item.label}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              item.completed 
                ? 'bg-green-100 text-green-800' 
                : item.required 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
            }`}>
              {item.completed ? 'Complete' : item.required ? 'Required' : 'Optional'}
            </span>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      {completionPercentage < 100 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Next Steps:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {requiredItems
              .filter(item => !item.completed)
              .map((item) => (
                <li key={item.id} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                  Complete your {item.label.toLowerCase()}
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;
