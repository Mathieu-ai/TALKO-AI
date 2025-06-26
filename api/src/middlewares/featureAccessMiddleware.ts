import { Request, Response, NextFunction } from 'express';
import { FeatureType } from '../types/featureTypes';

// Track feature usage in memory for anonymous users
const anonymousUsageMap = new Map<string, Map<FeatureType, number>>();

// Feature limits for anonymous users
export const ANONYMOUS_LIMITS: Record<FeatureType, number> = {
    [FeatureType.CHAT]: 5,
    [FeatureType.TEXT_TO_SPEECH]: 3,
    [FeatureType.SPEECH_TO_TEXT]: 3,
    [FeatureType.IMAGE_GENERATION]: 2,
    [FeatureType.DOCUMENT_ANALYSIS]: 2,
    [FeatureType.DOCUMENT_PROCESSING]: 2,
    [FeatureType.CONVERSATION]: 3,
    [FeatureType.DEEP_LEARNING]: 0, // Deep learning not available for anonymous users
    [FeatureType.NLP]: 3
};

/**
 * Middleware to check if anonymous user can access a feature
 */
export const checkAnonymousAccess = (featureType: FeatureType) => {
    return async (req: any, res: Response, next: NextFunction) => {
        // If user is logged in, always allow access
        if (req.user) {
            return next();
        }

        // Check if session exists
        if (!req.session) {
            return res.status(500).json({ error: 'Session not initialized' });
        }

        // Create anonymous session ID if not exists
        if (!req.session.anonymousId) {
            req.session.anonymousId = Math.random().toString(36).substring(2, 15);
        }

        req.anonymousSessionId = req.session.anonymousId;

        // For features that anonymous users can't access at all
        if (ANONYMOUS_LIMITS[featureType] === 0) {
            return res.status(403).json({
                error: 'Authentication required',
                message: 'Please log in to use this feature',
                requiresAuth: true
            });
        }

        // Check usage for other limited features
        const sessionUsage = getAnonymousUsage(req.anonymousSessionId);
        const currentUsage = sessionUsage.get(featureType) || 0;

        if (currentUsage >= ANONYMOUS_LIMITS[featureType]) {
            // Calculate a timestamp 24 hours from now
            const retryAfter = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            return res.status(403).json({
                error: 'Usage limit reached',
                message: 'Please log in to continue using this feature',
                requiresAuth: true,
                limit: ANONYMOUS_LIMITS[featureType],
                usage: currentUsage,
                retryAfter // Add timestamp when client should check again
            });
        }

        next();
    };
};

/**
 * Middleware to check if user has access to a feature
 */
export const checkFeatureAccess = (featureType: FeatureType) => {
    return async (req: any, res: Response, next: NextFunction) => {
        try {
            // If user is authenticated, they should have unlimited access
            if (req.user) {
                return next();
            }

            // For anonymous users, check if they've reached the anonymous limit
            if (!req.session.usage) {
                req.session.usage = {
                    conversations: 0,
                    images: 0,
                    textToSpeech: 0,
                    speechToText: 0,
                    documentProcessing: 0,
                    conversation: 0,
                    chat: 0
                };
            }

            // Map feature string to the appropriate usage counter
            const featureUsageKey = getFeatureUsageKey(featureType) as keyof typeof req.session.usage;
            const limit = ANONYMOUS_LIMITS[featureType] || 0;

            // Check feature limit
            if (req.session.usage[featureUsageKey as keyof typeof req.session.usage] >= limit) {
                return res.status(429).json({
                    error: 'Feature limit reached',
                    message: 'You have reached the limit for this feature. Please sign up or log in to continue.'
                });
            }

            // Increment usage counter
            req.session.usage[featureUsageKey]++;
            await req.session.save();

            next();
        } catch (error) {
            console.error('Error checking feature access:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking feature access'
            });
        }
    };
};

/**
 * Get anonymous usage for a session
 */
const getAnonymousUsage = (sessionId: string): Map<FeatureType, number> => {
    if (!anonymousUsageMap.has(sessionId)) {
        anonymousUsageMap.set(sessionId, new Map<FeatureType, number>());
    }
    return anonymousUsageMap.get(sessionId)!;
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (feature: FeatureType) => {
    return async (req: any, res: Response, next: NextFunction) => {
        try {
            // Initialize session usage if it doesn't exist
            if (!req.session.usage) {
                req.session.usage = {
                    conversations: 0,
                    images: 0,
                    textToSpeech: 0,
                    speechToText: 0,
                    documentProcessing: 0,
                    conversation: 0,
                    chat: 0
                };
            }

            // Increment the feature usage
            const featureKey = getFeatureUsageKey(feature) as keyof typeof req.session.usage;
            req.session.usage[featureKey]++;
            await req.session.save();

            next();
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};

/**
 * Get remaining usage for a feature
 */
export const getRemainingUsage = (sessionId: string, featureType: FeatureType): number => {
    if (!sessionId) return 0;

    const sessionUsage = getAnonymousUsage(sessionId);
    const currentUsage = sessionUsage.get(featureType) || 0;
    return Math.max(0, ANONYMOUS_LIMITS[featureType] - currentUsage);
};

/**
 * Helper function to map feature string to usage key
 */
function getFeatureUsageKey (feature: string): string {
    switch (feature) {
        case 'conversations':
            return 'conversations';
        case 'images':
            return 'images';
        case 'textToSpeech':
            return 'textToSpeech';
        case 'speechToText':
            return 'speechToText';
        case 'document_analysis':
            return 'documentProcessing';
        case 'conversation':
            return 'conversation';
        case 'chat':
            return 'chat';
        case 'deepLearning':
            return 'deepLearning';
        case 'nlp':
            return 'nlp';
        default:
            return feature;
    }
}
