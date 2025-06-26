import { useState } from 'react';
import { api } from '../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async (route: string, parameters: any = {}, method = 'POST') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api(route, parameters, method);
      
      if (!response.success && response.message) {
        setError(response.message);
      }
      
      return response;
    } catch (err) {
      setError('An unexpected error occurred');
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  return { callApi, loading, error };
}
