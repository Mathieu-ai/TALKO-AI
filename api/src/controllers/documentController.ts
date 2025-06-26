import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Document from '../models/document';
import { extractTextFromPDF, processCsvFile } from '../utils/fileProcessing';
import { openai } from '../config/openai';

const documentController = {
    // Process a document (general endpoint)
    processDocument: async (req: any, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Save document information to database
            const newDocument = new Document({
                userId: req.user._id,
                filename: req.file.filename,
                originalName: req.file.originalname,
                filePath: req.file.path,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                createdAt: new Date()
            });

            await newDocument.save();

            res.status(200).json({
                success: true,
                message: 'Document processed successfully',
                document: newDocument
            });
        } catch (error) {
            console.error('Error processing document:', error);
            res.status(500).json({ success: false, message: 'Error processing document' });
        }
    },

    // Extract text from a document
    extractText: async (req: any, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Implement text extraction logic here
            // This would typically use a library like pdf-parse, textract, etc.
            const extractedText = "Sample extracted text. Replace with actual extracted text.";

            // If user is authenticated, save to database
            if (req.user) {
                const newDocument = new Document({
                    userId: req.user._id,
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    filePath: req.file.path,
                    fileType: req.file.mimetype,
                    fileSize: req.file.size,
                    extractedText,
                    createdAt: new Date()
                });

                await newDocument.save();
            }

            res.status(200).json({
                success: true,
                extractedText
            });
        } catch (error) {
            console.error('Error extracting text:', error);
            res.status(500).json({ success: false, message: 'Error extracting text from document' });
        }
    },

    // Analyze Excel document
    analyzeExcel: async (req: any, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No Excel file uploaded' });
            }

            // Implement Excel analysis logic here
            const analysis = { summary: "Sample Excel analysis. Replace with actual analysis." };

            // Save to database
            const newDocument = new Document({
                userId: req.user._id,
                filename: req.file.filename,
                originalName: req.file.originalname,
                filePath: req.file.path,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                analysis,
                createdAt: new Date()
            });

            await newDocument.save();

            res.status(200).json({
                success: true,
                analysis
            });
        } catch (error) {
            console.error('Error analyzing Excel:', error);
            res.status(500).json({ success: false, message: 'Error analyzing Excel file' });
        }
    },

    // Summarize document
    summarizeDocument: async (req: any, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            // Get file extension
            const ext = path.extname(req.file.originalname).toLowerCase();
            let text = '';

            // Extract text based on file type
            switch (ext) {
                case '.pdf':
                    text = await extractTextFromPDF(req.file.path);
                    break;
                case '.csv':
                    const data = await processCsvFile(req.file.path);
                    text = JSON.stringify(data);
                    break;
                case '.txt':
                    text = fs.readFileSync(req.file.path, 'utf8');
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Unsupported file type'
                    });
            }

            // Generate summary using OpenAI
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a document summarization assistant. Provide a concise summary of the text."
                    },
                    {
                        role: "user", 
                        content: `Summarize the following text: ${text.substring(0, 4000)}...`
                    }
                ]
            });

            // If user is authenticated, save to database
            if (req.user) {
                const newDocument = new Document({
                    userId: req.user._id,
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    filePath: req.file.path,
                    fileType: req.file.mimetype,
                    fileSize: req.file.size,
                    summary: response.choices[0].message.content,
                    createdAt: new Date()
                });

                await newDocument.save();
            }

            // Return the summary
            res.status(200).json({
                success: true,
                summary: response.choices[0].message.content
            });

        } catch (error: any) {
            console.error('Error summarizing document:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to summarize document',
                error: error.message
            });
        }
    },

    // Analyze document
    analyzeDocument: async (req: any, res: Response) => {
        try {
            console.log('Document analysis request received:', {
                fileDetails: req.file ? {
                    filename: req.file.filename,
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                } : 'No file'
            });

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded. Please upload a document using the field name "document".'
                });
            }

            // Log file info for debugging
            console.log('Received file:', {
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            // Get the prompt from request body
            const prompt = req.body.prompt || '';

            // Get file extension
            const ext = path.extname(req.file.originalname).toLowerCase();
            let text = '';

            // Extract text based on file type
            switch (ext) {
                case '.pdf':
                    text = await extractTextFromPDF(req.file.path);
                    break;
                case '.csv':
                    const data = await processCsvFile(req.file.path);
                    text = JSON.stringify(data);
                    break;
                case '.txt':
                    text = fs.readFileSync(req.file.path, 'utf8');
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Unsupported file type'
                    });
            }

            // Generate analysis using OpenAI
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a document analysis assistant. Analyze the provided document."
                    },
                    {
                        role: "user",
                        content: prompt ? 
                            `${prompt}\n\nDocument text:\n${text.substring(0, 4000)}...` : 
                            `Analyze the following document text:\n\n${text.substring(0, 4000)}...`
                    }
                ]
            });

            // Save to database if user is authenticated
            if (req.user) {
                const newDocument = new Document({
                    userId: req.user._id,
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    filePath: req.file.path,
                    fileType: req.file.mimetype,
                    fileSize: req.file.size,
                    analysis: {
                        prompt,
                        result: response.choices[0].message.content
                    },
                    createdAt: new Date()
                });

                await newDocument.save();
            }

            // Return the analysis
            res.status(200).json({
                success: true,
                result: response.choices[0].message.content
            });
        } catch (error: any) {
            console.error('Error analyzing document:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error analyzing document',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    },

    // Get document history
    getDocumentHistory: async (req: any, res: Response) => {
        try {
            const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
            res.status(200).json({
                success: true,
                documents
            });
        } catch (error) {
            console.error('Error fetching document history:', error);
            res.status(500).json({ success: false, message: 'Error fetching document history' });
        }
    },

    // Get a specific document
    getDocument: async (req: any, res: Response) => {
        try {
            const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });

            if (!document) {
                return res.status(404).json({ success: false, message: 'Document not found' });
            }

            res.status(200).json({
                success: true,
                document
            });
        } catch (error) {
            console.error('Error fetching document:', error);
            res.status(500).json({ success: false, message: 'Error fetching document' });
        }
    },

    // Delete a document
    deleteDocument: async (req: any, res: Response) => {
        try {
            const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });

            if (!document) {
                return res.status(404).json({ success: false, message: 'Document not found' });
            }

            // Delete the file from the filesystem
            if (document.filePath) {
                fs.unlinkSync(document.filePath);
            }

            // Delete from database
            await Document.deleteOne({ _id: req.params.id });

            res.status(200).json({
                success: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({ success: false, message: 'Error deleting document' });
        }
    }
};

export default documentController;