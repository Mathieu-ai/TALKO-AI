import { openai, config } from '../config/openai';

// Function to analyze text using OpenAI's NLP capabilities
export const analyzeText = async (text: string) => {
    try {
        const response = await openai.chat.completions.create({
            model: config.textModel,
            messages: [
                { role: "system", content: "You are a helpful assistant that analyzes text." },
                { role: "user", content: text }
            ],
            max_tokens: 150,
        });
        return response.choices[0]?.message?.content?.trim() || '';
    } catch (error: any) {
        console.error("Error analyzing text:", error);
        throw new Error("NLP analysis failed");
    }
};

// Function to tokenize text
export const tokenizeText = (text: string) => {
    return text.split(/\s+/);
};

// Function to summarize text
export const summarizeText = async (text: string) => {
    try {
        const response = await openai.chat.completions.create({
            model: config.textModel,
            messages: [
                { role: "system", content: "You are a helpful assistant that summarizes text concisely." },
                { role: "user", content: `Summarize the following text:\n\n${text}` }
            ],
            max_tokens: 100,
        });
        return response.choices[0]?.message?.content?.trim() || '';
    } catch (error: any) {
        console.error("Error summarizing text:", error);
        throw new Error("Text summarization failed");
    }
};

// Function to extract keywords from text
export const extractKeywords = async (text: string) => {
    try {
        const response = await openai.chat.completions.create({
            model: config.textModel,
            messages: [
                { role: "system", content: "Extract the most important keywords from the text as a comma-separated list." },
                { role: "user", content: text }
            ],
            max_tokens: 50,
        });
        return response.choices[0]?.message?.content?.trim()?.split(',').map(keyword => keyword.trim()) || [];
    } catch (error: any) {
        console.error("Error extracting keywords:", error);
        throw new Error("Keyword extraction failed");
    }
};

// Function to get embeddings for text
export const getEmbeddings = async (text: string) => {
    try {
        const response = await openai.embeddings.create({
            model: config.embeddingModel,
            input: text,
        });
        return response.data[0]?.embedding || [];
    } catch (error: any) {
        console.error("Error generating embeddings:", error);
        throw new Error("Embedding generation failed");
    }
};

// Function to remove diacritics from a string
export function removeDiacritics(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Function to slugify a string
export function slugify(text: string): string {
    if (!text) return '';
    const slug = removeDiacritics(text.toLowerCase())
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    return slug || '';  // Return empty string if result is null
}

// Function to extract topics from text
export function extractTopics(text: string): string[] {
    if (!text) return [];
    
    const stopWords = [
        "the", "and", "is", "in", "to", "of", "a", "that", "it", "on", "for", "with", "as", "was", "at", "by", "an", "be", "this", "which"
    ]; // Add more stop words as needed
    
    const words = text.toLowerCase().split(/\s+/);
    const topics: string[] = [];
    
    for (const word of words) {
        if (word && word.length > 3 && !stopWords.includes(word)) {
            topics.push(word);
        }
    }
    
    return topics.length > 0 ? topics : [];  // Return empty array if no topics found
}

// Function to remove punctuation from text
export function removePunctuation(text: string): string {
    if (!text) return '';
    
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s{2,}/g, ' ');
}