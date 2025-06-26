import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api('user/profile', {}, 'GET');
      
      if (response.success && response.user) {
        setUser(response.user);
        return response.user;
      } else {
        setError(response.message || 'Failed to fetch user profile');
        return null;
      }
    } catch (err) {
      setError('An error occurred while fetching user data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auto-fetch user profile if a token exists
    const token = localStorage.getItem('talko_token');
    if (token) {
      fetchUserProfile();
    }
  }, [fetchUserProfile]);

  return { user, fetchUserProfile, loading, error };
}
