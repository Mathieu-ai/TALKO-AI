import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface for limits returned from the API
export interface FeatureLimits {
    chat: number;
    textToSpeech: number;
    speechToText: number;
    imageGeneration: number;
    documentAnalysis: number;
    documentProcessing: number;
    conversation: number;
}

// Default limits in case API request fails
const DEFAULT_LIMITS: FeatureLimits = {
    chat: 5,
    textToSpeech: 3,
    speechToText: 3,
    imageGeneration: 2,
    documentAnalysis: 1,
    documentProcessing: 1,
    conversation: 3
};

// Get feature limits from the API
export const getFeatureLimits = async (): Promise<FeatureLimits> => {
    try {
        const headers: Record<string, string> = {};
        const token = getToken();

        if (token) {
            headers['authorization'] = `Bearer ${token}`;
        }

        const response = await axios.get(`${API_URL}/features/limits`, { headers });
        return response.data.limits;
    } catch (error) {
        console.error('Failed to fetch feature limits:', error);
        // Return default limits if request fails
        return DEFAULT_LIMITS;
    }
};

// Get the remaining usage for a specific feature
export const getRemainingUsage = async (feature: keyof FeatureLimits): Promise<number> => {
    try {
        const headers: Record<string, string> = {};
        const token = getToken();

        if (token) {
            headers['authorization'] = `Bearer ${token}`;
        }

        const response = await axios.get(`${API_URL}/features/usage/${feature}`, { headers });
        return response.data.remaining;
    } catch (error) {
        console.error(`Failed to fetch remaining usage for ${feature}:`, error);
        return 0;
    }
};
