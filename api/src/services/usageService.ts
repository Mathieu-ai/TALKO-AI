import { FeatureType } from '../types/featureTypes';
import UserActivity from '../models/userActivity';
import { ANONYMOUS_LIMITS } from '../middlewares/featureAccessMiddleware';
import mongoose from 'mongoose';

// In-memory storage for tracking anonymous user feature usage
const anonymousUsageMap = new Map<string, Map<string, number>>();

/**
 * Check if a user has reached their usage limit for a feature
 * @param userId User ID or session ID
 * @param featureType Type of feature being used
 * @returns Object containing limit status and remaining usage
 */
export const checkUserLimit = async (
    userId: string,
    featureType: string
): Promise<{ hasReachedLimit: boolean; remaining: number; limit: number }> => {
    // Convert string feature type to enum if needed
    const feature = mapFeatureStringToEnum(featureType);
    if (!feature) {
        throw new Error(`Invalid feature type: ${featureType}`);
    }

    // Get the limit for this feature
    const limit = ANONYMOUS_LIMITS[feature];

    // For registered users (check by document ID format)
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        // Registered users have unlimited access
        return {
            hasReachedLimit: false,
            remaining: -1, // -1 indicates unlimited
            limit: -1
        };
    }

    // For anonymous users, check the in-memory tracker
    if (!anonymousUsageMap.has(userId)) {
        anonymousUsageMap.set(userId, new Map<string, number>());
    }

    const userUsage = anonymousUsageMap.get(userId)!;
    const currentUsage = userUsage.get(featureType) || 0;
    const remaining = Math.max(0, limit - currentUsage);

    return {
        hasReachedLimit: currentUsage >= limit,
        remaining,
        limit
    };
};

/**
 * Increment usage counter for a user and feature
 * @param userId User ID or session ID
 * @param featureType Type of feature being used
 */
export const incrementUserUsage = async (
    userId: string,
    featureType: string
): Promise<void> => {
    // Convert string feature type to enum if needed
    const feature = mapFeatureStringToEnum(featureType);
    if (!feature) {
        throw new Error(`Invalid feature type: ${featureType}`);
    }

    // For registered users, track in DB
    if (userId) {
        try {
            await UserActivity.create({
                userId,
                featureType: feature,
                isAnonymous: false,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error recording user activity:', error);
        }
        return;
    }

    // For anonymous users, update in-memory tracker
    if (!anonymousUsageMap.has(userId)) {
        anonymousUsageMap.set(userId, new Map<string, number>());
    }

    const userUsage = anonymousUsageMap.get(userId)!;
    const currentUsage = userUsage.get(featureType) || 0;
    userUsage.set(featureType, currentUsage + 1);

    try {
        // Also record in DB for analytics
        await UserActivity.create({
            sessionId: userId,
            featureType: feature,
            isAnonymous: true,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error recording anonymous activity:', error);
    }
};

/**
 * Reset usage for a specific user and feature (mostly for testing)
 * @param userId User ID or session ID
 * @param featureType Optional feature type, if not provided all features are reset
 */
export const resetUserUsage = async (
    userId: string,
    featureType?: string
): Promise<void> => {
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        // For registered users, nothing to do as they have unlimited access
        return;
    }

    // For anonymous users
    if (!anonymousUsageMap.has(userId)) {
        return;
    }

    const userUsage = anonymousUsageMap.get(userId)!;

    if (featureType) {
        userUsage.delete(featureType);
    } else {
        anonymousUsageMap.delete(userId);
    }
};

/**
 * Get usage data for all features for a specific user
 * @param userId User ID or session ID
 * @returns Map of feature usage with remaining counts
 */
export const getUserUsage = async (
    userId: string
): Promise<Record<string, { used: number; limit: number; remaining: number }>> => {
    const usage: Record<string, { used: number; limit: number; remaining: number }> = {};

    // For all feature types, get current usage status
    for (const feature of Object.values(FeatureType)) {
        const { hasReachedLimit, remaining, limit } = await checkUserLimit(userId, feature);

        // For registered users, limit will be -1 (unlimited)
        const used = limit === -1 ? 0 : limit - remaining;

        usage[feature] = {
            used,
            limit,
            remaining
        };
    }

    return usage;
};

/**
 * Record feature usage for a user
 * @param userId User ID or session ID
 * @param featureType Type of feature being used
 * @param resourceId Optional ID of the resource being accessed
 * @param resourceType Optional type of resource being accessed
 */
export const recordFeatureUsage = async (
    userId: string,
    featureType: FeatureType,
    resourceId?: string,
    resourceType?: string
): Promise<void> => {
    try {
        const isAnonymous = !userId;
        
        // Create user activity record
        await UserActivity.create({
            userId: isAnonymous ? undefined : userId,
            sessionId: isAnonymous ? userId : undefined,
            featureType,
            isAnonymous,
            timestamp: new Date(Date.now()),
            resourceId: resourceId ? resourceId : undefined,
            resourceType: resourceType ? resourceType : undefined
        });

        // Also update in-memory tracker for anonymous users
        if (isAnonymous) {
            await incrementUserUsage(userId, featureType);
        }
    } catch (error) {
        console.error('Error recording feature usage:', error);
    }
};

/**
 * Helper function to map feature string to enum
 */
function mapFeatureStringToEnum (feature: string): FeatureType | null {
    const mapping: Record<string, FeatureType> = {
        'chat': FeatureType.CHAT,
        'textToSpeech': FeatureType.TEXT_TO_SPEECH,
        'speechToText': FeatureType.SPEECH_TO_TEXT,
        'imageGeneration': FeatureType.IMAGE_GENERATION,
        'documentAnalysis': FeatureType.DOCUMENT_ANALYSIS,
        'documentProcessing': FeatureType.DOCUMENT_PROCESSING,
        'conversation': FeatureType.CONVERSATION,
        'nlp': FeatureType.NLP,
    };

    return mapping[feature] || null;
}