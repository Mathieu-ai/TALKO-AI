import { Request, Response } from 'express';
import deepLearningService from '../services/deepLearningService';
import { recordFeatureUsage } from '../services/usageService';
import { FeatureType } from '../types/featureTypes';

/**
 * Controller for deep learning operations
 */
class DeepLearningController {
  /**
   * Analyze user behavior patterns using deep learning
   */
  public async analyzeUserBehavior(req: any, res: Response) {
    try {
      // Get user ID from session
      const userId = req.user._id || 'anonymous';
      
      // Record feature usage
      if (userId) {
        await recordFeatureUsage(userId, FeatureType.DEEP_LEARNING);
      }
      
      // Only allow analysis for authenticated users
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for deep learning analysis'
        });
      }
      
      // Perform the analysis
      const analysis = await deepLearningService.analyzeUserBehavior(userId);
      
      return res.json(analysis);
    } catch (error) {
      console.error('Deep learning analysis error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze user data',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Get personalized learning recommendations
   */
  public async getRecommendations(req: any, res: Response) {
    try {
      // Get user ID from session
      const userId = req.user._id || 'anonymous';
      
      // Only allow recommendations for authenticated users
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for personalized recommendations'
        });
      }
      
      // Record feature usage
      await recordFeatureUsage(userId, FeatureType.DEEP_LEARNING);
      
      // Get recommendations
      const recommendations = await deepLearningService.getPersonalizedRecommendations(userId);
      
      return res.json(recommendations);
    } catch (error) {
      console.error('Recommendations error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate recommendations',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export default new DeepLearningController();
