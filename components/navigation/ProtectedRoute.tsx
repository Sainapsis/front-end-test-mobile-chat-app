import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoggedIn, loading } = useAppContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inProtectedGroup = segments.includes('(private)' as never); // Nueva forma de verificar

    if (!isLoggedIn && inProtectedGroup) {
      router.replace('/(public)/login');
    }
  }, [isLoggedIn, segments, loading]);

  return children;
}