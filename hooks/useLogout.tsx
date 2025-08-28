import { useCallback } from 'react';
import { storage } from '#imports';
import { useNavigate } from 'react-router-dom';

export function useLogout() {
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      // Clear access token
      await storage.removeItem('local:access-token');
      
      // Clear node endpoint
      await storage.removeItem('local:node-endpoint');
      
      // Clear any other auth-related data
      await storage.removeItem('local:user-data');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, try to redirect to login
      navigate('/login');
    }
  }, [navigate]);

  return { logout };
}
