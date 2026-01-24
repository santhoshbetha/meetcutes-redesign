import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to check JWT token expiration and automatically log out when expired
 * This hook provides additional token checking beyond the AuthContext
 */
export const useTokenExpiration = () => {
  const { userSession } = useAuth();

  useEffect(() => {
    if (!userSession) return;

    const checkToken = () => {
      const now = Math.floor(Date.now() / 1000);
      if (userSession.expires_at && userSession.expires_at < now) {
        console.log('Token expired via useTokenExpiration hook');
        // The AuthContext will handle the logout
        window.location.reload(); // Force a reload to trigger auth state change
      }
    };

    // Check immediately
    checkToken();

    // Check every minute
    const interval = setInterval(checkToken, 60 * 1000);

    return () => clearInterval(interval);
  }, [userSession]);

  return null;
};