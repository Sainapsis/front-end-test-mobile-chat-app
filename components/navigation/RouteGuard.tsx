import { useEffect, useRef } from 'react';
import { useSegments, useRouter } from 'expo-router';

/**
 * Props for RouteGuard component
 */
interface RouteGuardProps {
  isLoggedIn: boolean;
  loading: boolean;
}

/**
 * Component that guards routes based on authentication state
 * Redirects users to appropriate routes depending on their login status
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({ isLoggedIn, loading }) => {
  const segments = useSegments();
  const router = useRouter();
  const isMounted = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        if (!isLoggedIn && !loading) {
          router.replace('/login');
        }
        return;
      }

      if (loading) return;
      
      const inAuthGroup = segments[0] === 'login';
      
      if (!isLoggedIn && !inAuthGroup) {
        router.replace('/login');
      } else if (isLoggedIn && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [isLoggedIn, segments, loading]);

  return null;
};