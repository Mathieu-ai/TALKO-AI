/**
 * Utility functions for creating enhanced prompts for ChatGPT interactions
 */

/**
 * Creates an enhanced prompt that instructs ChatGPT to respond with emojis,
 * deep analysis, and good presentation in markdown format
 * @param task The main task or instruction for ChatGPT
 * @param additionalContext Optional additional context or data
 * @returns Enhanced prompt string
 */
export function createPrompt(task: string, additionalContext?: string): string {
  const basePrompt = `📋 **Task Analysis & Response**

🎯 **Based on the task**: ${task}

📝 **Instructions for your response**:
- 🎨 Add relevant emojis throughout your response
- 🔍 Analyze deeply the demand and requirements
- 🧠 Think critically about the best approach
- 📊 Present information in a clear, organized manner
- 📖 Respond using proper markdown syntax with headers, lists, and formatting
- 💡 Provide insights and recommendations where applicable

${additionalContext ? `📋 **Additional Context**: ${additionalContext}` : ''}

🚀 **Please proceed with your comprehensive analysis and response**:`;

  return basePrompt;
}

/**
 * Creates a specialized prompt for data analysis tasks
 * @param task The analysis task
 * @param data The data to analyze
 * @returns Enhanced analysis prompt
 */
export function createAnalysisPrompt(task: string, data: string): string {
  return createPrompt(
    `Perform data analysis: ${task}`,
    `Data to analyze: ${data.substring(0, 3000)}${data.length > 3000 ? '...' : ''}`
  );
}

/**
 * Creates a specialized prompt for recommendation tasks
 * @param task The recommendation task
 * @param userContext Context about the user
 * @returns Enhanced recommendation prompt
 */
export function createRecommendationPrompt(task: string, userContext: string): string {
  return createPrompt(
    `Generate personalized recommendations: ${task}`,
    `User context and interests: ${userContext}`
  );
}

/**
 * Creates a specialized prompt for content summarization
 * @param content The content to summarize
 * @param focusArea Optional specific area to focus on
 * @returns Enhanced summarization prompt
 */
export function createSummarizationPrompt(content: string, focusArea?: string): string {
  const task = focusArea 
    ? `Summarize the following content with special focus on: ${focusArea}`
    : 'Provide a comprehensive summary of the following content';
    
  return createPrompt(task, `Content: ${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}`);
}

/**
 * Creates a specialized prompt for document analysis
 * @param analysisType Type of analysis requested
 * @param documentContent The document content
 * @param userPrompt Optional user-specific prompt
 * @returns Enhanced document analysis prompt
 */
export function createDocumentAnalysisPrompt(
  analysisType: string, 
  documentContent: string, 
  userPrompt?: string
): string {
  const task = userPrompt 
    ? `Perform ${analysisType} analysis based on user request: ${userPrompt}`
    : `Perform comprehensive ${analysisType} analysis`;
    
  return createPrompt(task, `Document content: ${documentContent.substring(0, 4000)}${documentContent.length > 4000 ? '...' : ''}`);
}
