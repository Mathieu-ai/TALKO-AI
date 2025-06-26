import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { OpenAI } from 'openai';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Process image with OpenAI
export const analyzeImage = async (imagePath: string): Promise<string> => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's in this image? Provide a detailed description." },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${fs.readFileSync(imagePath, { encoding: 'base64' })}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });

        return response.choices[0].message.content || 'No analysis generated';
    } catch (error: any) {
        console.error('Error analyzing image:', error);
        throw new Error('Failed to analyze image');
    }
};

// Extract text from PDF
export const extractTextFromPDF = async (pdfPath: string): Promise<string> => {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error: any) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

// Analyze Excel file
export const analyzeExcel = async (excelPath: string): Promise<string> => {
    try {
        const workbook = XLSX.readFile(excelPath);
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
        
        return response.choices[0].message.content || 'No analysis generated';
    } catch (error: any) {
        console.error('Error analyzing Excel:', error);
        throw new Error('Failed to analyze Excel file');
    }
};

// Save temporary file
export const saveTempFile = (buffer: Buffer, extension: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const tempDir = './temp';
            
            // Create temp directory if it doesn't exist
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const fileName = `${Date.now()}.${extension}`;
            const filePath = `${tempDir}/${fileName}`;
            
            fs.writeFile(filePath, buffer, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(filePath);
                }
            });
        } catch (error: any) {
            reject(error);
        }
    });
};

// Process audio file
export const processAudioFile = async (filePath: string): Promise<string> => {
    try {
        const audioFile = fs.createReadStream(filePath);
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
        });
        return transcription.text;
    } catch (error: any) {
        console.error("Error processing audio:", error);
        throw new Error("Audio processing failed");
    }
};

// Process CSV file
export const processCsvFile = async (filePath: string): Promise<any[]> => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });
        return records;
    } catch (error: any) {
        console.error("Error processing CSV:", error);
        throw new Error("CSV processing failed");
    }
};

// Handle file upload
export const handleFileUpload = async (file: Express.Multer.File): Promise<string | any[]> => {
    const ext = path.extname(file.originalname).toLowerCase();
    switch (ext) {
        case '.pdf':
            return await extractTextFromPDF(file.path);
        case '.xlsx':
        case '.xls':
            return await analyzeExcel(file.path);
        case '.csv':
            return await processCsvFile(file.path);
        case '.jpg':
        case '.jpeg':
        case '.png':
            return await analyzeImage(file.path);
        case '.mp3':
        case '.wav':
        case '.m4a':
        case '.ogg':
            return await processAudioFile(file.path);
        default:
            throw new Error('Unsupported file type');
    }
};
