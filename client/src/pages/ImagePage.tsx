import React, { useState, useEffect } from 'react';
import useImageGeneration from '../hooks/useImageGeneration';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useFeatureLimits } from '../hooks/useFeatureLimits';

interface GeneratedImage {
    url: string;
    base64Data: string;
}

const ImagePage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const { generateImage, loading, error: generationError } = useImageGeneration();
    const { user } = useAuth();
    const { limits, getRemainingFor } = useFeatureLimits();
    const isLoggedIn = !!user;

    const [remainingImages, setRemainingImages] = useState<number | null>(null);
    const [limitLoading, setLimitLoading] = useState(true);
    const [limitReachedTimestamp, setLimitReachedTimestamp] = useState<number | null>(() => {
        const storedTimestamp = localStorage.getItem('imageLimitReachedAt');
        return storedTimestamp ? parseInt(storedTimestamp, 10) : null;
    });

    useEffect(() => {
        const fetchRemainingUsage = async () => {
            if (isLoggedIn) return;

            const now = Date.now();
            if (limitReachedTimestamp && now - limitReachedTimestamp < 24 * 60 * 60 * 1000) {
                setRemainingImages(0);
                setLimitLoading(false);
                return;
            }

            try {
                setLimitLoading(true);
                const remaining = await getRemainingFor('imageGeneration');
                setRemainingImages(remaining);

                if (remaining <= 0) {
                    const timestamp = Date.now();
                    setLimitReachedTimestamp(timestamp);
                    localStorage.setItem('imageLimitReachedAt', timestamp.toString());
                } else if (limitReachedTimestamp) {
                    setLimitReachedTimestamp(null);
                    localStorage.removeItem('imageLimitReachedAt');
                }
            } catch (error) {
                console.error('Error fetching remaining image generation usage:', error);
            } finally {
                setLimitLoading(false);
            }
        };

        fetchRemainingUsage();
    }, [isLoggedIn]);

    const imageLimit = limits?.imageGeneration || 1;
    const hasReachedLimit = !isLoggedIn && remainingImages !== null && remainingImages <= 0;

    const handleGenerateImage = async () => {
        if (!prompt.trim() || hasReachedLimit) return;

        try {
            const result = await generateImage(prompt);
            if (result) {
                setGeneratedImages(prev => [{
                    url: result.imageUrl,
                    base64Data: result.base64Data
                }, ...prev]);
            }

            if (!isLoggedIn) {
                const newRemaining = remainingImages !== null ? Math.max(0, remainingImages - 1) : null;
                setRemainingImages(newRemaining);

                if (newRemaining === 0) {
                    const timestamp = Date.now();
                    setLimitReachedTimestamp(timestamp);
                    localStorage.setItem('imageLimitReachedAt', timestamp.toString());
                }
            }
        } catch (error: any) {
            if (error.response?.status === 403 && error.response?.data?.error === 'Usage limit reached') {
                const timestamp = Date.now();
                setLimitReachedTimestamp(timestamp);
                localStorage.setItem('imageLimitReachedAt', timestamp.toString());
                setRemainingImages(0);
            }
            console.error('Error generating image:', error);
        }
    };

    const handleDownloadImage = async (base64Data: string) => {
        try {
            const a = document.createElement('a');
            a.href = base64Data;
            a.download = `generated-image-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const getTimeUntilReset = (): string => {
        if (!limitReachedTimestamp) return '';

        const now = Date.now();
        const timePassedMs = now - limitReachedTimestamp;
        const timeRemainingMs = Math.max(0, 24 * 60 * 60 * 1000 - timePassedMs);

        if (timeRemainingMs <= 0) return 'Refreshing soon';

        const hours = Math.floor(timeRemainingMs / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemainingMs % (60 * 60 * 1000)) / (60 * 1000));

        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="container mx-auto p-4 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4">Image Generation</h1>

            {!isLoggedIn && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-lg font-medium text-yellow-800">Free User Limits</h3>
                    <p className="text-yellow-700">
                        {limitLoading ? (
                            "Loading usage limits..."
                        ) : (
                            <>
                                You can generate {imageLimit} image per day as a guest user.
                                {remainingImages !== null && (
                                    hasReachedLimit ? (
                                        <span> Limit reached. Available again in: {getTimeUntilReset()}</span>
                                    ) : (
                                        <span> You have {remainingImages} image generation attempts remaining.</span>
                                    )
                                )}
                            </>
                        )}
                    </p>
                    <p className="mt-2">
                        <Link to="/login" className="text-blue-600 hover:underline font-medium">
                            Log in
                        </Link> or{' '}
                        <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                            Sign up
                        </Link>{' '}
                        for unlimited access.
                    </p>
                </div>
            )}

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the image you want to generate:
                </label>
                <div className="flex gap-2">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder={hasReachedLimit ? "Daily limit reached. Please log in to continue." : "A serene landscape with mountains and a lake at sunset..."}
                        disabled={hasReachedLimit}
                    />
                </div>
                <button
                    onClick={handleGenerateImage}
                    disabled={!prompt.trim() || loading || hasReachedLimit}
                    className={`mt-2 ${hasReachedLimit ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md disabled:opacity-50`}
                >
                    {hasReachedLimit ? 'Limit Reached' : loading ? 'Generating...' : 'Generate Image'}
                </button>
            </div>

            {loading && (
                <div className="text-center py-4">
                    <p>Creating your masterpiece...</p>
                    <div className="mt-2 w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
                </div>
            )}

            {generationError && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                    {generationError}
                </div>
            )}

            {generatedImages.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-3">Generated Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedImages.map((image, index) => (
                            <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                                <img src={image.base64Data} alt={`Generated ${index}`} className="w-full h-64 object-cover" />
                                <div className="p-2">
                                    <button
                                        onClick={() => handleDownloadImage(image.base64Data)}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagePage;
