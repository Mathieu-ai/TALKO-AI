import { openai } from "../config/openai";
import fs from "fs";
import path from "path";
import axios from "axios";

// Helper function to download image from URL and save to uploads folder
async function downloadImage (imageUrl: string): Promise<{ filePath: string, base64Data: string }> {
    try {
        // Create directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileName = `image_${Date.now()}.png`;
        const filePath = path.join(uploadDir, fileName);

        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, response.data);

        // Convert to base64
        const base64Data = Buffer.from(response.data).toString('base64');

        return {
            filePath: filePath,
            base64Data: `data:image/png;base64,${base64Data}`
        };
    } catch (error) {
        console.error('Error downloading image:', error);
        throw new Error('Failed to download and process image');
    }
}

export async function generateImage (prompt: string, size: string = '1024x1024'): Promise<{ imageUrl: string, localPath: string, base64Data: string }> {
    try {
        // Handle undefined prompt
        if (!prompt) {
            throw new Error('Image generation prompt is required');
        }

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size as any,
        });

        // Get the image URL
        const imageUrl = response.data[0]?.url || '';
        if (!imageUrl) {
            throw new Error('No image URL returned from OpenAI');
        }

        // Download the image and get base64
        const { filePath, base64Data } = await downloadImage(imageUrl);

        return {
            imageUrl,
            localPath: filePath,
            base64Data
        };
    } catch (error: any) {
        console.error('Error generating image:', error);
        throw error;
    }
}

export async function analyzeImage (imageUrl: string, prompt: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            max_tokens: 500,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: { url: imageUrl },
                        },
                    ],
                },
            ],
        });

        const analysisText = response.choices[0]?.message?.content || '';
        return analysisText;
    } catch (error: any) {
        console.error('Error analyzing image:', error);
        throw error;
    }
}

export async function enhanceImage (imageUrl: string): Promise<string> {
    try {
        if (!imageUrl) {
            throw new Error('Image URL is required for enhancement');
        }

        // Your image enhancement logic here
        // For now, we'll just return the original URL
        return imageUrl;
    } catch (error: any) {
        console.error('Error enhancing image:', error);
        throw error;
    }
}

export async function getImageCaption (imageUrl: string): Promise<string> {
    try {
        if (!imageUrl) {
            throw new Error('Image URL is required for captioning');
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            max_tokens: 100,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Generate a brief caption for this image." },
                        {
                            type: "image_url",
                            image_url: { url: imageUrl },
                        },
                    ],
                },
            ],
        });

        return response.choices[0]?.message?.content || 'Image caption unavailable';
    } catch (error: any) {
        console.error('Error getting image caption:', error);
        throw error;
    }
}