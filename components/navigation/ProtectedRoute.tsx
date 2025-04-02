import React, { useEffect } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoggedIn, loading } = useAppContext();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const inProtectedGroup = segments.includes('(private)' as never); 

    if (pathname.includes('(public)')) return;
    
    if (!isLoggedIn && inProtectedGroup) {
      router.replace('/(public)/login');
    }
  }, [isLoggedIn, segments, loading]);

  return children;
}