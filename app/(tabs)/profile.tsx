import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { ProfileTemplate } from '@/design_system/components/templates';

export default function ProfileScreen() {
  const { currentUser, logout, loading } = useAppContext();

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

