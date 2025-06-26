import { FeatureName } from '../types/chat';
import { isAuthenticated } from '../utils/auth';
import { FeatureLimits } from './featureLimitsService';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const USAGE_STORAGE_KEY = 'talko_feature_usage';

/**
 * Records a feature usage in localStorage and optionally on the server
 * @param feature The feature being used
 * @returns Promise that resolves when recording is complete
 */
export const recordFeatureUsage = async (feature: FeatureName): Promise<void> => {
  // Update local storage usage tracking
  const storedUsage = localStorage.getItem(USAGE_STORAGE_KEY);
  let usage = {
    conversations: 0,
    images: 0,
    textToSpeech: 0,
    speechToText: 0,
    documentProcessing: 0,
    conversation: 0,
    chat: 0
  };

  if (storedUsage) {
    try {
      usage = JSON.parse(storedUsage);
    } catch (err) {
      console.error('Error parsing usage data:', err);
    }
  }

  // Increment the usage counter for this feature
  usage[feature] += 1;
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));

  // If user is authenticated, record usage on the server
  if (isAuthenticated()) {
    try {
      // Map client feature names to server feature types if needed
      const serverFeature = mapFeatureNameToServerType(feature);
      
      await axios.post(`${API_URL}/features/record`, {
        feature: serverFeature
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('talko_token')}`
        }
      });
    } catch (error) {
      console.error('Failed to record feature usage on server:', error);
      // Continue anyway - local tracking will still work
    }
  }
};

/**
 * Maps client feature names to server feature types
 */
function mapFeatureNameToServerType(feature: FeatureName): string {
  const mapping: Record<FeatureName, string> = {
    conversations: 'conversations',
    images: 'imageGeneration',
    textToSpeech: 'textToSpeech',
    speechToText: 'speechToText',
    documentProcessing: 'documentProcessing',
    conversation: 'conversation',
    chat: 'chat'
  };
  
  return mapping[feature] || feature;
}

/**
 * Gets the remaining usage for a feature
 * @param feature Feature to check
 * @returns Promise resolving to number of uses remaining
 */
export const getRemainingUsage = async (feature: FeatureName): Promise<number> => {
  // If user is authenticated, they have unlimited usage
  if (isAuthenticated()) {
    return Infinity;
  }

  // Get usage from local storage
  const storedUsage = localStorage.getItem(USAGE_STORAGE_KEY);
  let usage = {
    conversations: 0,
    images: 0,
    textToSpeech: 0,
    speechToText: 0,
    documentProcessing: 0,
    conversation: 0,
    chat: 0
  };

  if (storedUsage) {
    try {
      usage = JSON.parse(storedUsage);
    } catch (err) {
      console.error('Error parsing usage data:', err);
    }
  }

  // Get limits from server if possible
  try {
    const serverFeature = mapFeatureNameToServerType(feature);
    const response = await axios.get(`${API_URL}/features/usage/${serverFeature}`);
    
    if (response.data.success) {
      return response.data.remaining;
    }
  } catch (error) {
    console.error('Error fetching remaining usage from server:', error);
    // Fall back to local calculation if server request fails
  }

  // Use local default limits as fallback
  const DEFAULT_LIMITS: Record<FeatureName, number> = {
    conversations: 3,
    images: 2,
    textToSpeech: 3,
    speechToText: 3,
    documentProcessing: 1,
    conversation: 3,
    chat: 5
  };

  return Math.max(0, DEFAULT_LIMITS[feature] - usage[feature]);
};

/**
 * Resets all usage data in local storage
 */
export const resetAllUsage = (): void => {
  localStorage.removeItem(USAGE_STORAGE_KEY);
};
