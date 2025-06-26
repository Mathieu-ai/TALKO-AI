import {api} from './api';

/**
 * Service for NLP-related operations
 */
export const nlpService = {
  /**
   * Analyze the sentiment of text
   * @param text - Text to analyze
   * @returns Sentiment analysis results
   */
  analyzeSentiment: async (text: string) => {
    try {
      const response = await api('/nlp/sentiment', { text });
      return response;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  },

  /**
   * Extract named entities from text
   * @param text - Text to analyze
   * @returns Extracted entities
   */
  extractEntities: async (text: string) => {
    try {
      const response = await api('/nlp/entities', { text });
      return response;
    } catch (error) {
      console.error('Error extracting entities:', error);
      throw error;
    }
  },

  /**
   * Extract keywords from text
   * @param text - Text to analyze
   * @returns Extracted keywords
   */
  extractKeywords: async (text: string) => {
    try {
      const response = await api('/nlp/keywords', { text });
      return response;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      throw error;
    }
  },

  /**
   * Summarize text
   * @param text - Text to summarize
   * @param maxLength - Optional maximum length for the summary
   * @returns Text summary
   */
  summarizeText: async (text: string, maxLength?: number) => {
    try {
      const response = await api('/nlp/summarize', { text, maxLength });
      return response;
    } catch (error) {
      console.error('Error summarizing text:', error);
      throw error;
    }
  }
};

export default nlpService;
