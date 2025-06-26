import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAudioProcessing from '../hooks/useAudioProcessing';
import AudioHistorySidebar from '../components/AudioHistorySidebar';
import { isAuthenticated, canAccessFeature, getFeatureAccessMessage, canDownload } from '../utils/auth';
import { api } from '../services/api';
import AudioService from '../services/audioService';
import MiniAudioPlayer from '../components/MiniAudioPlayer';
import AudioPlayerService from '../services/audioPlayerService';

const AudioPage: React.FC = () => {
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
    const [_currentlyPlayingItem, setCurrentlyPlayingItem] = useState<any | null>(null);
    const [transcription, setTranscription] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [audioHistory, setAudioHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const { textToSpeech, speechToText, loading, error, authRequired, hasReachedLimit } = useAudioProcessing();

    const [textToSpeechExpanded, setTextToSpeechExpanded] = useState(true);
    const [speechToTextExpanded, setSpeechToTextExpanded] = useState(true);

    // Updated reference to audio player service
    const audioPlayerService = AudioPlayerService.getInstance();

    // Check authentication status
    const isLoggedIn = isAuthenticated();
    const canUseTextToSpeech = canAccessFeature('textToSpeech');
    const canUseSpeechToText = canAccessFeature('speechToText');
    const userCanDownload = canDownload();

    // Fetch audio history when component mounts if user is logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchAudioHistory();
        }
    }, [isLoggedIn]);

    // Function to fetch audio history from API with better error handling
    const fetchAudioHistory = async () => {
        if (!isLoggedIn) return;

        setIsLoadingHistory(true);
        setHistoryError(null);

        try {
            console.log('Fetching audio history...');
            const response = await api('audio/history', {}, 'GET');
            
            console.log('Audio history response:', response);

            if (response) {
                if (response.success) {
                    const formattedHistory = response.audioHistory.map((item: any) => ({
                        id: item._id,
                        date: new Date(item.createdAt).toLocaleString(),
                        title: item.text || 'Untitled audio',
                        type: item.type === 'text_to_speech' ? 'text-to-speech' : 'speech-to-text',
                        audioUrl: item.audioUrl,
                        duration: item.duration || '',
                    }));

                    setAudioHistory(formattedHistory);
                } else if (response.status === 401) {
                    // Handle authentication errors specifically
                    setHistoryError('Authentication required. Please log in again.');
                    // You might want to trigger a logout or redirect to login here
                } else {
                    console.error('API returned error:', response);
                    // Detailed error message
                    const errorDetail = response.message ? `: ${response.message}` : '';
                    setHistoryError(`Failed to load audio history${errorDetail}`);
                }
            } else {
                setHistoryError('No response from server. Please check your connection.');
            }
        } catch (error: any) {
            console.error('Exception in fetchAudioHistory:', error);
            // More detailed error message based on the type of error
            const errorMessage = error.message || 'Unknown error';
            setHistoryError(`Failed to load audio history. ${errorMessage}`);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Update error message when there's an error from the hook
    useEffect(() => {
        if (error) {
            setErrorMessage(error);
        }
    }, [error]);

    // Add event listeners to the audio element
    useEffect(() => {
        const audioElement = audioRef.current;
        if (audioElement) {
            const handlePlay = () => { };
            const handlePause = () => { };
            const handleEnded = () => {
                // Clear the currently playing item when audio ends
                setCurrentlyPlayingItem(null);
            };

            audioElement.addEventListener('play', handlePlay);
            audioElement.addEventListener('pause', handlePause);
            audioElement.addEventListener('ended', handleEnded);

            return () => {
                audioElement.removeEventListener('play', handlePlay);
                audioElement.removeEventListener('pause', handlePause);
                audioElement.removeEventListener('ended', handleEnded);
            };
        }
    }, [audioRef.current]);

    const handleTextToSpeech = async () => {
        if (!text.trim()) return;

        if (!canUseTextToSpeech) {
            setErrorMessage(getFeatureAccessMessage('textToSpeech'));
            return;
        }

        setErrorMessage(null);
        try {
            // Stop any currently playing audio
            audioPlayerService.stopCurrentAudio();
            
            const result = await textToSpeech(text, { voice: selectedVoice as any });

            if (result) {
                setAudioUrl(result);
                setActiveAudioUrl(result); // Set as active for playback

                // Use the audioPlayerService to play the audio
                await audioPlayerService.playAudio(result);

                if (isLoggedIn) {
                    await fetchAudioHistory();
                    setIsSidebarOpen(true);
                }
            }
        } catch (error: any) {
            console.error('Error in text-to-speech:', error);
            setErrorMessage(error.message || 'An error occurred during text-to-speech conversion');
        }
    };

    const handleStartRecording = async () => {
        if (!canUseSpeechToText) {
            setErrorMessage(getFeatureAccessMessage('speechToText'));
            return;
        }

        try {
            setErrorMessage(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks: BlobPart[] = [];

            mediaRecorder.addEventListener('dataavailable', (event) => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                setActiveAudioUrl(url);

                try {
                    const result = await speechToText(audioBlob);
                    setTranscription(result);

                    if (isLoggedIn) {
                        await fetchAudioHistory();
                        setIsSidebarOpen(true);
                    }
                } catch (error: any) {
                    console.error('Error in speech-to-text:', error);
                    setErrorMessage(error.message || 'An error occurred during speech-to-text conversion');
                }
            });

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error: any) {
            console.error('Error accessing microphone:', error);
            setErrorMessage(error.message || 'Error accessing microphone');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSelectHistoryItem = async (item: any) => {
        // console.log('Selected item:', item);
        // Don't change the text in the textbox anymore
        // Only change the transcription if it's a speech-to-text item
        if (item.type === 'speech-to-text') {
            setTranscription(item.title);
        }
    };

    const handlePlayAudio = async (url: string, item: any) => {
        try {
            // Don't set loading if we already have a valid URL
            if (!url) {
                setErrorMessage("No audio URL available for this item.");
                return;
            }
            
            setIsLoadingHistory(true);
            
            // Verify if the audio is valid before setting it
            const isValid = await audioPlayerService.verifyAudio(url);
            
            if (isValid) {
                // Stop any currently playing audio first
                audioPlayerService.stopCurrentAudio();
                
                // Set the currently playing item
                setCurrentlyPlayingItem(item);
                
                // Process the URL and start playback
                try {
                    await audioPlayerService.playAudio(url);
                    setActiveAudioUrl(url); // Set this after successful playback start
                } catch (err) {
                    console.error("Error playing audio:", err);
                    setErrorMessage("Error starting audio playback.");
                }
            } else {
                setErrorMessage("Couldn't play this audio file. It may be expired or unavailable.");
            }
        } catch (error) {
            console.error("Error playing audio:", error);
            setErrorMessage("Error playing audio file.");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleStopAudio = () => {
        // Stop any playing audio and clean up
        audioPlayerService.stopCurrentAudio();
        audioPlayerService.disconnectCurrentSource();
        setCurrentlyPlayingItem(null);
        setActiveAudioUrl(null);
    };

    const handleDownloadSelected = async (items: any[]) => {
        if (!userCanDownload) {
            setErrorMessage('You must be logged in to download audio files.');
            return;
        }

        if (items.length === 0) {
            setErrorMessage('No items selected for download.');
            return;
        }

        setIsDownloading(true);
        try {
            // Always use the ZIP download approach for consistency
            const audioIds = items.map(item => item.id);
            await AudioService.downloadMultipleAsZip(audioIds);
        } catch (error: any) {
            console.error('Error downloading files:', error);
            setErrorMessage(error.message || 'Failed to download audio files');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleRetryFetchHistory = () => {
        fetchAudioHistory();
    };

    // Clean up audio context when component unmounts
    useEffect(() => {
        return () => {
            // Clean up audio playback resources
            audioPlayerService.closeAudioContext();
        };
    }, []);

    return (
        <div className="container mx-auto p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 h-full overflow-y-auto relative">
            {/* Toggle button for sidebar */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed right-4 top-20 z-30 bg-primary-700 hover:bg-primary-600 text-white p-2 rounded-full shadow-lg"
                aria-label="Open history"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {/* Audio History Sidebar with enhanced functionality */}
            <AudioHistorySidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                historyItems={audioHistory}
                onSelectItem={handleSelectHistoryItem}
                onPlayAudio={handlePlayAudio}
                onDownloadSelected={handleDownloadSelected}
                error={historyError}
                isLoading={isLoadingHistory}
                onRetry={handleRetryFetchHistory}
            />

            {/* Mini Audio Player */}
            {activeAudioUrl && (
                <MiniAudioPlayer 
                    audioUrl={activeAudioUrl} 
                    onClose={handleStopAudio} 
                />
            )}

            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-primary-300">Audio Processing</h1>

            {!isLoggedIn && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-primary-300 mb-2">Limited Access</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        You are using Talko AI as a guest.
                        <Link to="/login" className="underline font-medium ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                            Log in
                        </Link> or
                        <Link to="/signup" className="underline font-medium ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                            sign up
                        </Link> for full access to all features, unlimited usage, and to save your history.
                    </p>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>• Text-to-Speech: {getFeatureAccessMessage('textToSpeech')}</p>
                        <p>• Speech-to-Text: {getFeatureAccessMessage('speechToText')}</p>
                        <p>• History & Downloads: Available only for registered users</p>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
                    {errorMessage}
                    {hasReachedLimit && !isLoggedIn && (
                        <div className="mt-2">
                            <Link to="/login" className="underline font-medium text-primary-600 dark:text-primary-300">
                                Log in
                            </Link> or
                            <Link to="/signup" className="underline font-medium ml-1 text-primary-600 dark:text-primary-300">
                                sign up
                            </Link> to continue using this feature.
                        </div>
                    )}
                </div>
            )}

            {isDownloading && (
                <div className="mb-4 p-3 bg-primary-100 dark:bg-primary-900 border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-100 rounded flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing your download...
                </div>
            )}

            <div className="space-y-6">
                {/* Text to Speech Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div 
                        className="p-4 bg-gray-200 dark:bg-gray-700 flex justify-between items-center cursor-pointer"
                        onClick={() => setTextToSpeechExpanded(!textToSpeechExpanded)}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-primary-300">Text to Speech</h2>
                        <div className="text-gray-600 dark:text-gray-400">
                            {textToSpeechExpanded ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </div>
                    
                    {textToSpeechExpanded && (
                        <div className="p-4">
                            <div className="mb-3">
                                <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Select Voice
                                </label>
                                <select
                                    id="voice-select"
                                    value={selectedVoice}
                                    onChange={(e) => setSelectedVoice(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                >
                                    <option value="alloy">Alloy</option>
                                    <option value="echo">Echo</option>
                                    <option value="fable">Fable</option>
                                    <option value="onyx">Onyx</option>
                                    <option value="nova">Nova</option>
                                    <option value="shimmer">Shimmer</option>
                                </select>
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                rows={5}
                                placeholder="Enter text to convert to speech..."
                            />
                            <button
                                onClick={handleTextToSpeech}
                                disabled={!text.trim() || loading || !canUseTextToSpeech}
                                className="mt-2 bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                            >
                                {loading ? 'Converting...' : 'Convert to Speech'}
                            </button>
                            {!canUseTextToSpeech && !isLoggedIn && (
                                <div className="mt-2 text-sm text-yellow-700 dark:text-orange-400">
                                    <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                                        Log in
                                    </Link> to use this feature more than once.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Speech to Text Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div 
                        className="p-4 bg-gray-200 dark:bg-gray-700 flex justify-between items-center cursor-pointer"
                        onClick={() => setSpeechToTextExpanded(!speechToTextExpanded)}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-primary-300">Speech to Text</h2>
                        <div className="text-gray-600 dark:text-gray-400">
                            {speechToTextExpanded ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </div>
                    
                    {speechToTextExpanded && (
                        <div className="p-4">
                            <div className="flex items-center space-x-4 mb-4">
                                <button
                                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                                    disabled={authRequired && !isLoggedIn}
                                    className={`p-3 rounded-full ${isRecording
                                        ? 'bg-red-600 dark:bg-red-700 hover:bg-red-500 dark:hover:bg-red-600'
                                        : 'bg-primary-700 hover:bg-primary-600'
                                        } text-white disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center`}
                                >
                                    {isRecording ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    )}
                                </button>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {isRecording ? 'Speak clearly into your microphone' : 'Records audio from your microphone'}
                                    </p>
                                </div>
                            </div>
                            
                            {loading && !isRecording && (
                                <div className="mb-4 flex items-center text-gray-700 dark:text-gray-400">
                                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing your audio...
                                </div>
                            )}
                            
                            {!canUseSpeechToText && !isLoggedIn && (
                                <div className="mt-2 mb-4 text-sm text-yellow-700 dark:text-orange-400">
                                    <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                                        Log in
                                    </Link> to use the speech-to-text feature.
                                </div>
                            )}
                            
                            {transcription && (
                                <div className="mt-4">
                                    <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">Transcription:</h3>
                                    <div className="p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200">
                                        {transcription}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden audio element for background playback */}
            {(audioRef && audioUrl) && <audio
                ref={audioRef}
                src={audioUrl || ''}
                className="hidden"
                preload="auto"
                crossOrigin="anonymous"
            />}
        </div>
    );
};

export default AudioPage;
