import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  emailVerified: boolean;
  memberSince: string;
  walletBalance: number;
  bonusWallet: number;
  totalReferrals: number;
  referralCode?: string;
  fastTrackEligible: boolean;
  fastTrackActivated: boolean;
  virtualAccountNumber?: string;
  virtualAccountBank?: string;
  lastUpdated?: string;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: { displayName: string; phoneNumber: string }) => Promise<boolean>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<boolean>;
}

export const useProfile = (): UseProfileReturn => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Error loading profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData: { displayName: string; phoneNumber: string }): Promise<boolean> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchProfile(); // Refresh profile data
        return true;
      } else {
        setError(data.error || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      setError('Error updating profile');
      console.error('Profile update error:', err);
      return false;
    }
  };

  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }): Promise<boolean> => {
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        setError(data.error || 'Failed to change password');
        return false;
      }
    } catch (err) {
      setError('Error changing password');
      console.error('Password change error:', err);
      return false;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/profile');
        const data = await response.json();
        
        if (data.success) {
          setProfile(data.profile);
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch (err) {
        setError('Error loading profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      loadProfile();
    }
  }, [session]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    changePassword
  };
};
