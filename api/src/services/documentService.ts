import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { join, dirname } from 'path';
import * as XLSX from 'xlsx';
import { OpenAI } from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define AIService interface for type safety
interface AIService {
    generateSummary(text: string): Promise<string>;
    analyzeContent(text: string, prompt?: string): Promise<string>;
}

class DocumentService {
    private aiService: AIService;

    constructor() {
        // Initialize the AI service
        this.aiService = {
            generateSummary: async (text: string): Promise<string> => {
                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: "You are a document summarization assistant. Provide a concise summary of the text."
                            },
                            {
                                role: "user",
                                content: `Please summarize the following text:\n\n${text}`
                            }
                        ],
                        max_tokens: 500
                    });
                    
                    return response.choices[0]?.message.content || 'No summary generated';
                } catch (error) {
                    console.error('Error generating summary:', error);
                    throw new Error('Failed to generate summary');
                }
            },
            
            analyzeContent: async (text: string, prompt: string = ''): Promise<string> => {
                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: "You are a document analysis assistant. Analyze the provided text."
                            },
                            {
                                role: "user",
                                content: prompt ? 
                                    `${prompt}\n\nDocument text:\n${text}` : 
                                    `Analyze the following document text:\n\n${text}`
                            }
                        ],
                        max_tokens: 800
                    });
                    
                    return response.choices[0]?.message.content || 'No analysis generated';
                } catch (error) {
                    console.error('Error analyzing content:', error);
                    throw new Error('Failed to analyze content');
                }
            }
        };
    }

    async extractText(filePath: string): Promise<string> {
        try {
            const fileExtension = filePath.split('.').pop()?.toLowerCase();
            
            if (fileExtension === 'pdf') {
                return this.extractTextFromPDF(filePath);
            } else if (fileExtension === 'docx' || fileExtension === 'doc') {
                return this.extractTextFromWord(filePath);
            } else {
                throw new Error('Unsupported file format');
            }
        } catch (error: any) {
            console.error('Error extracting text:', error);
            throw new Error('Failed to extract text from document');
        }
    }

    private async extractTextFromPDF(filePath: string): Promise<string> {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            
            if (pdfData.text === null) {
                return '';
            }
            
            return pdfData.text;
        } catch (error: any) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    private async extractTextFromWord(filePath: string): Promise<string> {
        try {
            // For simplicity, we'll use GPT to extract text from Word
            // In a real application, you might want to use a specialized library like mammoth
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a document processing assistant. Extract the text from the uploaded Word document."
                    }
                ]
            });
            
            const extractedText = response.choices[0]?.message.content;
            
            if (extractedText === null) {
                return '';
            }
            
            return extractedText || '';
        } catch (error: any) {
            console.error('Error extracting text from Word:', error);
            throw new Error('Failed to extract text from Word document');
        }
    }

    async analyzeExcel(filePath: string): Promise<string> {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Convert to string for analysis
            const dataStr = JSON.stringify(jsonData, null, 2);
            
            // Use OpenAI to analyze the Excel data
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a data analysis assistant. Analyze the Excel data and provide insights."
                    },
                    {
                        role: "user",
                        content: `Analyze this Excel data: ${dataStr}`
                    }
                ]
            });
            
            return response.choices[0]?.message.content || 'No analysis generated';
        } catch (error: any) {
            console.error('Error analyzing Excel:', error);
            throw new Error('Failed to analyze Excel file');
        }
    }

    async generateImage(text: string): Promise<string> {
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: text,
                n: 1,
                size: "1024x1024",
            });
            
            return response.data[0].url || '';
        } catch (error: any) {
            console.error('Error generating image:', error);
            throw new Error('Failed to generate image');
        }
    }

    public async processDocument(file: Express.Multer.File) {
        // Implementation for document processing
        const filePath = file.path;
        // Process the document based on your requirements
        // This is a placeholder implementation
        return {
            success: true,
            message: 'Document processed successfully',
            filePath
        };
    }

    public async transcribeAudio(file: Express.Multer.File) {
        // Implementation for audio transcription
        const filePath = file.path;
        // Transcribe the audio file based on your requirements
        // This is a placeholder implementation
        return {
            success: true,
            message: 'Audio transcribed successfully',
            filePath,
            text: 'This is a placeholder for the transcribed text.'
        };
    }

    /**
     * Summarizes the content of a document
     * @param filePath Path to the document file
     * @returns A summary of the document
     */
    public async summarizeDocument(filePath: string): Promise<string> {
        try {
            // Read the file content
            const fileContent = await this.readFileContent(filePath);
            
            // Call AI service to generate summary
            const summary = await this.aiService.generateSummary(fileContent);
            
            return summary;
        } catch (error) {
            console.error('Error summarizing document:', error);
            throw new Error('Failed to summarize document');
        }
    }

    /**
     * Analyzes a document based on a prompt
     * @param filePath Path to the document file
     * @param prompt Optional prompt to guide the analysis
     * @returns Analysis result
     */
    public async analyzeDocument(filePath: string, prompt: string = ''): Promise<string> {
        try {
            // Read the file content
            const fileContent = await this.readFileContent(filePath);
            
            // Call AI service to analyze document
            const result = await this.aiService.analyzeContent(fileContent, prompt);
            
            return result;
        } catch (error) {
            console.error('Error analyzing document:', error);
            throw new Error('Failed to analyze document');
        }
    }

    /**
     * Helper method to read file content based on file type
     * @param filePath Path to the file
     * @returns The extracted content as string
     */
    private async readFileContent(filePath: string): Promise<string> {
        // Determine file type based on extension
        if (filePath.endsWith('.pdf')) {
            return this.extractTextFromPDF(filePath);
        } else if (filePath.endsWith('.docx')) {
            return this.extractTextFromWord(filePath);
        } else if (filePath.endsWith('.txt')) {
            return this.readTextFile(filePath);
        } else {
            throw new Error('Unsupported file format');
        }
    }

    private async readTextFile(filePath: string): Promise<string> {
        try {
            const data = await fsPromises.readFile(filePath, 'utf-8');
            return data;
        } catch (error) {
            console.error('Error reading text file:', error);
            throw new Error('Failed to read text file');
        }
    }
}

export default DocumentService;