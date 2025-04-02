import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { ProfileTemplate } from '@/design_system/components/templates';

/**
 * Profile screen component that handles user profile display and logout functionality
 */
export default function ProfileScreen() {
  const { currentUser, logout, loading } = useAppContext();

  /**
   * Handles user logout
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <ProfileTemplate
      loading={loading}
      user={currentUser || undefined}
      onLogout={handleLogout}
    />
  );
}

