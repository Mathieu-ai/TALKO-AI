import { Request, Response } from 'express';
import { openai, config } from '../config/openai';
import { extractKeywords, getEmbeddings, removeDiacritics, slugify } from '../utils/nlpHelpers';
import { incrementUserUsage } from '../services/usageService';
import { FeatureType } from '../types/featureTypes';
import { createPrompt } from '../utils/promptHelpers';

/**
 * Controller for NLP operations
 */
class NlpController {
  /**
   * Analyze sentiment of provided text
   */
  public async analyzeSentiment(req: any, res: Response) {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required for sentiment analysis'
        });
      }
      
      // Record feature usage
      const userId = req.user._id || req.session.userId || 'anonymous';
      await incrementUserUsage(userId, FeatureType.NLP);
      
      // Use enhanced prompt for sentiment analysis
      const sentimentPrompt = createPrompt(
        'Analyze the sentiment of the provided text and categorize it as positive, negative, or neutral with a confidence score',
        `Text to analyze: "${text}"`
      );
      
      const response = await openai.chat.completions.create({
        model: config.textModel,
        messages: [
          {
            role: 'user',
            content: sentimentPrompt
          }
        ],
        max_tokens: 150
      });
      
      return res.json({
        success: true,
        sentiment: response.choices[0].message.content,
        text
      });
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze sentiment',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Extract named entities from text
   */
  public async extractEntities(req: any, res: Response) {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required for entity extraction'
        });
      }
      
      // Record feature usage
      const userId = req.user._id|| req.session.userId || 'anonymous';
      await incrementUserUsage(userId, FeatureType.NLP);
      
      // Use enhanced prompt for entity extraction
      const entityPrompt = createPrompt(
        'Extract named entities from the text and categorize them (person, organization, location, date, etc.)',
        `Text to analyze: "${text}"`
      );
      
      const response = await openai.chat.completions.create({
        model: config.textModel,
        messages: [
          {
            role: 'user',
            content: entityPrompt
          }
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      });
      
      try {
        // Parse the JSON response
        const content = response.choices[0].message.content || "{}";
        const entities = JSON.parse(content);
        
        return res.json({
          success: true,
          entities,
          text
        });
      } catch (parseError) {
        return res.json({
          success: true,
          rawResponse: response.choices[0].message.content,
          text
        });
      }
    } catch (error) {
      console.error('Entity extraction error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to extract entities',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Extract keywords from text
   */
  public async extractKeywords(req: any, res: Response) {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required for keyword extraction'
        });
      }
      
      // Record feature usage
      const userId = req.user._id|| req.session.userId || 'anonymous';
      await incrementUserUsage(userId, FeatureType.NLP);
      
      // Use existing keyword extraction utility
      const keywords = await extractKeywords(text);
      
      return res.json({
        success: true,
        keywords,
        text
      });
    } catch (error) {
      console.error('Keyword extraction error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to extract keywords',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Summarize text
   */
  public async summarizeText(req: any, res: Response) {
    try {
      const { text, maxLength } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required for summarization'
        });
      }
      
      // Record feature usage
      const userId = req.user._id|| req.session.userId || 'anonymous';
      await incrementUserUsage(userId, FeatureType.NLP);
      
      // Use enhanced prompt for summarization
      const summaryPrompt = createPrompt(
        `Summarize the provided text${maxLength ? ` in ${maxLength} words or less` : ''}`,
        `Text to summarize: "${text}"`
      );
      
      const response = await openai.chat.completions.create({
        model: config.textModel,
        messages: [
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        max_tokens: 500
      });
      
      return res.json({
        success: true,
        summary: response.choices[0].message.content,
        text
      });
    } catch (error) {
      console.error('Text summarization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to summarize text',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export default new NlpController();
