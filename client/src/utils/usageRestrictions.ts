import { FeatureName, FeatureUsage } from '../types/chat';
import { recordFeatureUsage, getRemainingUsage as getServerRemainingUsage } from '../services/usageService';

const DEFAULT_LIMITS: Record<FeatureName, number> = {
    conversations: 3,
    images: 2,
    textToSpeech: 3,
    speechToText: 3,
    documentProcessing: 1,
    conversation: 3,
    chat: 5
};

const USAGE_STORAGE_KEY = 'talko_feature_usage';

const getUsage = (): FeatureUsage => {
    const storedUsage = localStorage.getItem(USAGE_STORAGE_KEY);
    if (storedUsage) {
        try {
            return JSON.parse(storedUsage);
        } catch (err) {
            console.error('Error parsing usage data:', err);
        }
    }

    return {
        conversations: 0,
        images: 0,
        textToSpeech: 0,
        speechToText: 0,
        documentProcessing: 0,
        conversation: 0,
        chat: 0
    };
};

const saveUsage = (usage: FeatureUsage): void => {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
};

export const checkUsageLimit = (feature: FeatureName, isLoggedIn: boolean): boolean => {
    if (isLoggedIn) return true;

    const usage = getUsage();
    const limit = DEFAULT_LIMITS[feature];

    return usage[feature] < limit;
};

export const incrementUsage = async (feature: FeatureName): Promise<void> => {
    // Use the new service to record usage
    await recordFeatureUsage(feature);
    
    // Also update the local usage object for backwards compatibility
    const usage = getUsage();
    usage[feature] += 1;
    saveUsage(usage);
};

export const getUsageRemaining = async (feature: FeatureName, isLoggedIn: boolean): Promise<number> => {
    if (isLoggedIn) return Infinity;

    // Try to get remaining usage from server
    try {
        return await getServerRemainingUsage(feature);
    } catch (error) {
        console.error('Error getting remaining usage from server:', error);
        
        // Fall back to local calculation
        const usage = getUsage();
        const limit = DEFAULT_LIMITS[feature];
        return Math.max(0, limit - usage[feature]);
    }
};

export const resetUsage = (): void => {
    localStorage.removeItem(USAGE_STORAGE_KEY);
};
