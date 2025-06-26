import express from 'express';
import { FeatureType } from '../types/featureTypes';
import { ANONYMOUS_LIMITS, getRemainingUsage } from '../middlewares/featureAccessMiddleware';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

// Get all feature limits
router.get('/limits', isAuthenticated, (req: any, res) => {
  try {
    // If user is authenticated, they have unlimited access
    if (req.user) {
      const unlimitedLimits = Object.keys(ANONYMOUS_LIMITS).reduce((acc, key) => {
        acc[key] = -1; // -1 indicates unlimited
        return acc;
      }, {} as Record<string, number>);
      
      return res.json({
        success: true,
        limits: unlimitedLimits
      });
    }
    
    // Return anonymous limits
    res.json({
      success: true,
      limits: ANONYMOUS_LIMITS
    });
  } catch (error) {
    console.error('Error fetching feature limits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feature limits'
    });
  }
});

// Get remaining usage for a specific feature
router.get('/usage/:feature', isAuthenticated, (req: any, res) => {
  try {
    const { feature } = req.params;
    
    // If user is authenticated, they have unlimited access
    if (req.user) {
      return res.json({
        success: true,
        feature,
        remaining: -1 // -1 indicates unlimited
      });
    }
    
    // For anonymous users, calculate remaining usage
    const featureType = mapFeatureStringToEnum(feature);
    if (!featureType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feature type'
      });
    }
    
    const sessionId = req.anonymousSessionId || req.session.anonymousId;
    const remaining = getRemainingUsage(sessionId, featureType);
    
    res.json({
      success: true,
      feature,
      remaining,
      total: ANONYMOUS_LIMITS[featureType]
    });
  } catch (error) {
    console.error('Error getting feature usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get remaining usage'
    });
  }
});

// Helper function to map string feature names to enum values
function mapFeatureStringToEnum(feature: string): FeatureType | null {
  const mapping: Record<string, FeatureType> = {
    'chat': FeatureType.CHAT,
    'textToSpeech': FeatureType.TEXT_TO_SPEECH,
    'speechToText': FeatureType.SPEECH_TO_TEXT,
    'imageGeneration': FeatureType.IMAGE_GENERATION,
    'documentAnalysis': FeatureType.DOCUMENT_ANALYSIS,
    'documentProcessing': FeatureType.DOCUMENT_PROCESSING,
    'conversation': FeatureType.CONVERSATION,
    'deepLearning': FeatureType.DEEP_LEARNING,
    'nlp': FeatureType.NLP
  };
  
  return mapping[feature] || null;
}

export default router;
