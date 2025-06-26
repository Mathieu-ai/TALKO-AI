import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ImageGenerationResult {
    imageUrl: string;
    base64Data: string;
}

interface UseImageGenerationReturn {
    generateImage: (prompt: string) => Promise<ImageGenerationResult>;
    loading: boolean;
    error: string | null;
}

const useImageGeneration = (): UseImageGenerationReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const generateImage = async (prompt: string): Promise<ImageGenerationResult> => {
        setLoading(true);
        setError(null);

        try {
            const response = await api('images/generate', { prompt });

            if (!response.success) {
                throw new Error(response.message || 'Failed to generate image');
            }

            if (!response.imageUrl && !response.base64Data) {
                throw new Error('No image data returned from the server');
            }

            return {
                imageUrl: response.imageUrl,
                base64Data: response.base64Data
            };
        } catch (error: any) {
            console.error('Error generating image:', error);
            const errorMessage = error.message || 'Failed to generate image';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        generateImage,
        loading,
        error
    };
};

export default useImageGeneration;
