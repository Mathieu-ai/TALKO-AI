import { openai, config } from '../config/openai';
import Conversation from '../models/conversation';
import Message from '../models/message';
import UserActivity from '../models/userActivity';
import { getEmbeddings } from '../utils/nlpHelpers';
import { createPrompt, createAnalysisPrompt, createRecommendationPrompt } from '../utils/promptHelpers';

/**
 * Deep Learning Service using OpenAI's models
 * Handles deep learning tasks and pattern recognition in user data
 */
export class DeepLearningService {
  /**
   * Analyze user conversations and identify patterns
   * @param userId - User ID to analyze
   * @returns Analysis results with patterns and insights
   */
  public async analyzeUserBehavior(userId: string) {
    try {
      const conversations = await Conversation.find({ userId }).sort({ createdAt: -1 }).limit(50) as Array<{ _id: string }>;
      
      if (conversations.length === 0) {
        return {
          success: false,
          message: 'Not enough conversation data to analyze'
        };
      }
      
      // Get messages from each conversation
      const conversationIds = conversations.map(conv => conv._id);
      const messages = await Message.find({ conversationId: { $in: conversationIds } }).sort({ createdAt: 1 });
      
      // Get user activity for feature usage patterns
      const userActivity = await UserActivity.find({ userId }).sort({ timestamp: -1 }).limit(100);
      
      // Prepare data for analysis
      const conversationTexts = conversations.map(conv => {
        const convMessages = messages.filter(msg => msg.conversationId.toString() === conv._id.toString());
        return convMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      }).join('\n\n');
      
      // Extract feature usage patterns
      const featureUsage = userActivity.reduce((acc: any, activity) => {
        const feature = activity.featureType;
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {});
      
      // Use enhanced prompt for analysis
      const analysisPrompt = createAnalysisPrompt(
        'Analyze user behavior patterns, topics of interest, and interaction styles',
        `Conversation history: ${conversationTexts.substring(0, 4000)}. Feature usage stats: ${JSON.stringify(featureUsage)}`
      );

      const response = await openai.chat.completions.create({
        model: config.textModel,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 1000
      });
      
      // Format and return the analysis
      return {
        success: true,
        analysis: response.choices[0].message.content,
        topicsOfInterest: await this.extractTopicsOfInterest(conversationTexts),
        usagePatterns: featureUsage,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Deep learning analysis error:', error);
      return {
        success: false,
        message: 'Failed to analyze user data',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Extract key topics of interest from user conversations using embeddings
   * @param text - Text from conversations
   * @returns Array of topics with relevance scores
   */
  private async extractTopicsOfInterest(text: string) {
    try {
      // Generate embeddings for the text
      const embeddings = await getEmbeddings(text.substring(0, 8000));
      
      // Use enhanced prompt for topic extraction
      const topicPrompt = createPrompt(
        'Extract the main topics and themes from conversation text',
        `Text to analyze: ${text.substring(0, 3000)}`
      );

      const response = await openai.chat.completions.create({
        model: config.textModel,
        messages: [
          {
            role: 'user',
            content: topicPrompt
          }
        ],
        max_tokens: 300
      });
      
      const topics = response.choices[0].message.content?.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) || [];
      
      return topics;
    } catch (error) {
      console.error('Error extracting topics:', error);
      return [];
    }
  }
  
  /**
   * Get learning recommendations based on user's past interactions
   * @param userId - User ID to get recommendations for
   * @returns Personalized learning recommendations
   */
  public async getPersonalizedRecommendations(userId: string) {
    try {
      // Get recent user interactions
      const conversations = await Conversation.find({ userId }).sort({ createdAt: -1 }).limit(10);
      
      if (conversations.length === 0) {
        return {
          success: false,
          message: 'Not enough data to generate recommendations'
        };
      }
      
      // Get topics from conversation titles
      const topics = conversations.map(conv => conv.title).join(', ');
      
      // Use enhanced prompt for recommendations
      const recommendationPrompt = createRecommendationPrompt(
        'Generate 5 personalized learning recommendations including resources, topics to explore, and skills to develop',
        `User's conversation topics and interests: ${topics}`
      );

      const response = await openai.chat.completions.create({
        model: config.textModel,
        messages: [
          {
            role: 'user',
            content: recommendationPrompt
          }
        ],
        max_tokens: 500
      });
      
      return {
        success: true,
        recommendations: response.choices[0].message.content,
        basedOn: topics,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return {
        success: false,
        message: 'Failed to generate recommendations',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

export default new DeepLearningService();
