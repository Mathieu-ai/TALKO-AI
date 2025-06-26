import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AudioService from '../services/audioService';
import { AudioOptions, TranscriptionResult } from '../types/audio';
import { isAuthenticated, canAccessFeature } from '../utils/auth';

interface UseAudioProcessingReturn {
    textToSpeech: (text: string, options?: AudioOptions) => Promise<string>;
    speechToText: (audioBlob: Blob) => Promise<string>;
    loading: boolean;
    error: string | null;
    canDownload: boolean;
    authRequired: boolean;
    hasReachedLimit: boolean;
}

const useAudioProcessing = (): UseAudioProcessingReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasReachedLimit, setHasReachedLimit] = useState(false);

    // Get authentication status
    const isLoggedIn = isAuthenticated();
    const canDownload = isLoggedIn;
    const speechToTextAvailable = isLoggedIn || canAccessFeature('speechToText');

    // Reset state when auth changes
    useEffect(() => {
        setError(null);
        setHasReachedLimit(false);
    }, [isLoggedIn]);

    const textToSpeech = async (text: string, options: AudioOptions = { voice: 'alloy' }): Promise<string> => {
        setLoading(true);
        setError(null);

        try {
            const audioOptions = {
                ...options,
                voice: options.voice || 'alloy',
            };
            const response = await AudioService.generateSpeech(text, audioOptions);
            console.log('Audio response received in hook:', response);
            
            // Use streamUrl as priority over audioUrl for better compatibility
            const audioUrlToUse = response.streamUrl || response.audioUrl;
            
            // Get full URL including server base URL - using appropriate API method
            const fullAudioUrl = await AudioService.getAudioFile(audioUrlToUse);
            console.log('Full audio URL to return:', fullAudioUrl);
            return fullAudioUrl;
        } catch (err: any) {
            console.error('Error in text-to-speech:', err);

            // Check if error is due to usage limit
            if (err.response && err.response.status === 403) {
                setHasReachedLimit(true);
                const errorMessage = 'You have reached the limit for text-to-speech. Please log in to continue.';
                setError(errorMessage);
                throw new Error(errorMessage);
            }

            const errorMessage = err.message || 'Failed to convert text to speech';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const speechToText = async (audioBlob: Blob): Promise<string> => {
        setLoading(true);
        setError(null);

        if (!speechToTextAvailable) {
            const errorMessage = 'Speech-to-text requires authentication. Please log in to use this feature.';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }

        try {
            const result = await AudioService.transcribeSpeech(audioBlob);

            if (process.env.NODE_ENV === 'development') {
                console.log('Speech to text response:', result);
            }

            return result.text;
        } catch (err: any) {
            console.error('Error in speech-to-text:', err);

            // Check if error is due to usage limit
            if (err.response && err.response.status === 403) {
                setHasReachedLimit(true);
                const errorMessage = 'You need to log in to use speech-to-text.';
                setError(errorMessage);
                throw new Error(errorMessage);
            }

            const errorMessage = err.message || 'Failed to convert speech to text';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        textToSpeech,
        speechToText,
        loading,
        error,
        canDownload,
        authRequired: !speechToTextAvailable,
        hasReachedLimit
    };
};

export default useAudioProcessing;
