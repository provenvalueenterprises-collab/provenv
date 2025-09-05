import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useProfile } from '../lib/hooks/useProfile';
import ProfileCompletion from '../components/ProfileCompletion';
import { 
  ArrowLeft, 
  LogOut, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Wallet, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Key,
  DollarSign,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { profile, loading, error, updateProfile, changePassword } = useProfile();
  
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: profile?.displayName || '',
    phoneNumber: profile?.phoneNumber || ''
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formLoading, setFormLoading] = useState(false);

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName,
        phoneNumber: profile.phoneNumber || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    const success = await updateProfile({
      displayName: editForm.displayName,
      phoneNumber: editForm.phoneNumber
    });

    if (success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
    } else {
      setMessage({ type: 'error', text: error || 'Failed to update profile' });
    }
    setFormLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setFormLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      setFormLoading(false);
      return;
    }

    const success = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    if (success) {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setChangePasswordMode(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: error || 'Failed to change password' });
    }
    setFormLoading(false);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success/Error Messages */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-t-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{profile?.displayName || 'Loading...'}</h1>
                      <p className="text-blue-100">{profile?.email}</p>
                    </div>
                  </div>
                  {!editMode && !changePasswordMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                {editMode ? (
                  /* Edit Form */
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+234..."
                        required
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="flex items-center bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {formLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setEditForm({
                            displayName: profile?.displayName || '',
                            phoneNumber: profile?.phoneNumber || ''
                          });
                        }}
                        className="flex items-center bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : changePasswordMode ? (
                  /* Password Change Form */
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        minLength={8}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters long</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="flex items-center bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        {formLoading ? 'Changing...' : 'Change Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChangePasswordMode(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="flex items-center bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Profile Display */
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <User className="h-5 w-5 text-primary-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Display Name</span>
                          </div>
                          <p className="text-gray-900 font-medium">{profile?.displayName || 'Not set'}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Mail className="h-5 w-5 text-primary-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Email Address</span>
                          </div>
                          <p className="text-gray-900 font-medium">{profile?.email}</p>
                          <div className="flex items-center mt-1">
                            {profile?.emailVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                            )}
                            <span className={`text-xs ${profile?.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                              {profile?.emailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Phone className="h-5 w-5 text-primary-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Phone Number</span>
                          </div>
                          <p className="text-gray-900 font-medium">{profile?.phoneNumber || 'Not set'}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Member Since</span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {profile?.memberSince ? formatDate(profile.memberSince) : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setChangePasswordMode(true)}
                        className="flex items-center bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Wallet Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Wallet className="h-5 w-5 mr-2 text-primary-600" />
                  Wallet Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Main Wallet</span>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {profile ? formatCurrency(profile.walletBalance) : 'Loading...'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bonus Wallet</span>
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {profile ? formatCurrency(profile.bonusWallet) : 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary-600" />
                  Referrals
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Referrals</span>
                    <p className="text-2xl font-bold text-primary-600">
                      {profile?.totalReferrals || 0}
                    </p>
                  </div>
                  {profile?.referralCode && (
                    <div>
                      <span className="text-sm text-gray-600">Your Referral Code</span>
                      <p className="text-lg font-mono font-bold text-gray-900 bg-gray-100 p-2 rounded">
                        {profile.referralCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fast Track Status */}
              {profile && (profile.fastTrackEligible || profile.fastTrackActivated) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary-600" />
                    Fast Track
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Eligible</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.fastTrackEligible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.fastTrackEligible ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Activated</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.fastTrackActivated 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.fastTrackActivated ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Virtual Account */}
              {profile?.virtualAccountNumber && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                    Virtual Account
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Account Number</span>
                      <p className="text-lg font-mono font-bold text-gray-900">
                        {profile.virtualAccountNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Bank</span>
                      <p className="text-gray-900 font-medium">
                        {profile.virtualAccountBank || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Completion */}
              {profile && (
                <ProfileCompletion profile={profile} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
