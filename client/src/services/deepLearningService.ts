import { api } from './api';

/**
 * Service for deep learning operations
 */
export const deepLearningService = {
  /**
   * Analyze user behavior patterns
   * @returns Analysis results
   */
  analyzeUserBehavior: async () => {
    try {
      const response = await api('/deep-learning/analyze', {}, 'GET');
      return response;
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      throw error;
    }
  },

  /**
   * Get personalized learning recommendations
   * @returns Recommendations based on user history
   */
  getRecommendations: async () => {
    try {
      const response = await api('/deep-learning/recommendations', {}, 'GET');
      return response;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
};

export default deepLearningService;
