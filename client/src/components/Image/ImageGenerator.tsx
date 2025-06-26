import React, { useState, useEffect } from 'react';
import { checkUsageLimit, incrementUsage } from '../../utils/usageRestrictions';
import LoginPrompt from '../LoginPrompt';
import { FeatureName } from '../../types/chat';

export interface ImageGeneratorProps {
    isLoggedIn: boolean;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ isLoggedIn }) => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [canGenerate, setCanGenerate] = useState(true);

    useEffect(() => {
        // Check if user can generate images based on login status and usage
        const checkImageUsage = () => {
            const canUseImages = checkUsageLimit('images' as FeatureName, isLoggedIn);
            setCanGenerate(canUseImages);
        };

        checkImageUsage();
    }, [isLoggedIn]);

    const handleGenerateImage = async () => {
        if (!prompt.trim() || !canGenerate) return;

        setLoading(true);
        setError(null);

        try {
            // API call to generate image
            // const response = await generateImage(prompt);
            // setImage(response.imageUrl);

            // Mock image generation for demonstration
            setTimeout(() => {
                setImage(`https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt)}`);

                // If user is not logged in, increment usage and check if they've reached the limit
                if (!isLoggedIn) {
                    incrementUsage('images' as FeatureName);
                    setCanGenerate(checkUsageLimit('images' as FeatureName, isLoggedIn));
                }

                setLoading(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to generate image');
            setLoading(false);
        }
    };

    return (
        <div className="image-generator p-4">
            <h2 className="text-2xl font-bold mb-4">AI Image Generator</h2>

            <div className="mb-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={4}
                    disabled={!canGenerate}
                />
            </div>

            <button
                onClick={handleGenerateImage}
                disabled={!prompt.trim() || loading || !canGenerate}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {loading ? 'Generating...' : 'Generate Image'}
            </button>

            {error && (
                <div className="text-red-500 mt-2">{error}</div>
            )}

            {!canGenerate && !isLoggedIn && (
                <LoginPrompt feature="image generation" />
            )}

            {image && (
                <div className="mt-4">
                    <h3 className="text-xl font-medium mb-2">Generated Image</h3>
                    <img
                        src={image}
                        alt="Generated from prompt"
                        className="max-w-full h-auto rounded shadow-lg"
                    />
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;
