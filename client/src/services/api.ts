import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';

// Get base URL from environment or default to localhost:5000
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Maximum number of retries for network errors
const MAX_RETRIES = 2;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // This ensures cookies are sent with requests
});

// Add request interceptor to automatically add the token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('talko_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function joinUrl(base: string, path: string) {
  if (base.endsWith('/') && path.startsWith('/')) {
    return base + path.substring(1);
  }
  if (!base.endsWith('/') && !path.startsWith('/')) {
    return base + '/' + path;
  }
  return base + path;
}

const api = async (route: string, parameters: {} = {}, method = 'POST', additionalConfig: any = {}) => {
    method = method.toUpperCase();
    
    // Log the API call for debugging
    console.log(`API call: ${method} ${joinUrl(BASE_URL, route)}`);
    
    const token = localStorage.getItem('talko_token');
    if (!token) {
        console.warn('No authentication token found in localStorage');
    }
    
    const config = {
        url: joinUrl(BASE_URL, route),
        method,
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        },
        [method === 'GET' ? 'params' : 'data']: parameters,
        ...additionalConfig,
        timeout: 15000
    };
    
    let retries = 0;
    
    while (retries <= MAX_RETRIES) {
        try {
            console.log(`Attempt ${retries + 1} to connect to ${config.url}`);
            const response = await axiosInstance.request(config);
            console.log(`API response received for ${route}:`, response.status);
            return response.data;
        } catch (e: any) {
            const error = e as AxiosError;
            
            // Log detailed error information
            console.error('API request failed:', {
                url: config.url,
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.message,
                code: error.code
            });
            
            // If it's a network error and we haven't exceeded retries, retry
            if (error.code === 'ERR_NETWORK' && retries < MAX_RETRIES) {
                console.log(`Network error, retrying (${retries + 1}/${MAX_RETRIES})...`);
                retries++;
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                continue;
            }
            
            // Handle different error scenarios with more specific messages
            if (error.response) {
                // The server responded with an error status code
                return { 
                    ok: false, 
                    status: error.response.status,
                    message: `Server error: ${error.response.status}` 
                };
            } else if (error.request) {
                // The request was made but no response was received
                return { 
                    ok: false, 
                    message: 'No response received from server. Please check your network connection and server status.' 
                };
            } else {
                // Something happened in setting up the request
                return { 
                    ok: false, 
                    message: `Request configuration error: ${error.message}` 
                };
            }
        }
    }
    
    return { ok: false, message: 'Maximum retry attempts reached' };
};

// Add a specific function for audio requests that ensures proper authentication
export const getAudioWithAuth = async (audioUrl: string): Promise<string> => {
  try {
    const token = localStorage.getItem('talko_token');
    
    // Log the token for debugging (remove in production)
    console.log('Using auth token for audio request:', token ? 'Token available' : 'No token');
    
    // Fix duplicate /api/ in the URL
    if (audioUrl.includes('/api/api/')) {
      audioUrl = audioUrl.replace('/api/api/', '/api/');
    }
    
    // Handle non-URL audio IDs by converting them to the correct stream URL format
    if (audioUrl.includes('audio_') && !audioUrl.includes('stream')) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const audioId = audioUrl.split('audio_').pop();
      if (audioId) {
        // Ensure we don't have duplicate api/ in the path
        audioUrl = joinUrl(baseUrl, `/api/audio/stream/audio_${audioId}`);
      }
    }
    
    // Remove duplicate api pattern if present
    if (audioUrl.includes('/api/api/')) {
      audioUrl = audioUrl.replace('/api/api/', '/api/');
    }
    
    console.log('Final audio URL:', audioUrl);
    
    const response = await axios.get(audioUrl, {
      responseType: 'blob',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      withCredentials: true,
    });
    
    // Create a blob URL that can be used in audio elements
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Error fetching audio:', error);
    throw error;
  }
};

export const downloadAudiosAsZip = async (audioIds: string[]): Promise<Blob> => {
    const token = localStorage.getItem('talko_token'); // Use the correct token key
    
    const response = await axiosInstance.post(
        joinUrl(BASE_URL, '/audio/download-multiple'),
        { audioIds },
        {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
            responseType: 'blob',
        }
    );
    
    return response.data;
};

export { api, axiosInstance };

