'use client';

import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserProfileProps {
  showToast: (title: string, desc: string, type: 'success' | 'error' | 'info') => void;
}

export default function UserProfile({ showToast }: UserProfileProps) {
  const { isAuthenticated, userEmail, userName, logout } = useAuth();

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    showToast('Logged Out', 'You have been logged out.', 'info');
  };

  return (
    <div className="user-profile-section" id="user-profile-section">
      <div className="user-avatar">
        <User />
      </div>
      <div className="user-info">
        <span className="user-name" id="user-name" title={userName || 'User'}>
          {userName || 'User'}
        </span>
        <span className="user-email" id="user-email" title={userEmail || ''}>
          {userEmail}
        </span>
        <button className="logout-btn" id="logout-btn" onClick={handleLogout}>
          <LogOut /> Log out
        </button>
      </div>
    </div>
  );
}
