import { useState } from 'react';
import apiService from '@/providers/api/apiService';


export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const get = async (endpoint: string, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get(endpoint, config);
      return response.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const post = async (endpoint: string, payload: any, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post(endpoint, payload, config);
      return response.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { get, post, loading, error };
};