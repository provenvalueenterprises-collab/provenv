import React, { useState } from 'react';
import { User, Camera, Upload } from 'lucide-react';

interface ProfileAvatarProps {
  displayName: string;
  email: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onAvatarChange?: (file: File) => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  displayName,
  email,
  avatarUrl,
  size = 'md',
  editable = false,
  onAvatarChange
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  const avatarContent = avatarUrl ? (
    <img
      src={avatarUrl}
      alt={`${displayName}'s avatar`}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
      {getInitials(displayName, email)}
    </div>
  );

  return (
    <div 
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${
        editable ? 'cursor-pointer' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {avatarContent}
      
      {editable && (
        <>
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Change profile picture"
          />
        </>
      )}
    </div>
  );
};

export default ProfileAvatar;
