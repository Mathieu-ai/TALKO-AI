import {api} from '../services/api';
import { User, setAuth, logout as logoutUtil } from '../utils/auth';

// Define interfaces for request data
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api('/auth/login', credentials);
    
    // Store token and user data using auth utility
    if (response.data.token && response.data.user) {
      setAuth(response.data.token, response.data.user);
    }

    // Store the token in localStorage
    if (response.data.token) {
      localStorage.setItem('talko_token', response.data.token);
    }
    
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      throw (error as any).response?.data || error;
    }
    throw error;
  }
};

export const register = async (userData: RegisterData) => {
  try {
    const response = await api('/auth/register', userData);
    
    // Store token and user data using auth utility
    if (response.data.token && response.data.user) {
      setAuth(response.data.token, response.data.user);
    }
    
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      throw (error as any).response?.data || error;
    }
    throw error;
  }
};

export const logout = () => {
  logoutUtil();
  return api('/auth/logout');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api('/auth/me', {}, 'GET');
    return response.data.user;
  } catch (error) {
    return null;
  }
};

export { isAuthenticated } from '../utils/auth';
