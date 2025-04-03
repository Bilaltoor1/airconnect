import React from 'react';

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className={`avatar ${className}`}>
      <div className={`${sizeClass} rounded-full overflow-hidden bg-base-200`}>
        {user?.profileImage ? (
          <img 
            src={user.profileImage}
            alt={`${user?.name || 'User'}'s profile`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={`https://avatar.iran.liara.run/username?username=${user?.name || 'anonymous'}`}
            alt={`${user?.name || 'User'}'s profile`}
            className="w-full h-full object-cover" 
          />
        )}
      </div>
    </div>
  );
};

export default UserAvatar;
