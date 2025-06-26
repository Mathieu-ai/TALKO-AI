import React, { useState, useEffect, useRef } from 'react';
import { AudioPlayerProps } from '../types/audio';
import AudioPlayerService from '../services/audioPlayerService';
import AudioService from '../services/audioService';

const MiniAudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(0));
    const [audioFileUrl, setAudioFileUrl] = useState<string>('');
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    
    // Refs
    const progressBarRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    
    // Get singleton instance of AudioPlayerService
    const audioPlayerService = AudioPlayerService.getInstance();

    // Get the shared audio element from the service
    const audioElement = audioPlayerService.getAudioElement();

    useEffect(() => {
        // Reset state when audio URL changes
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setIsLoading(true);
        setAudioLevels(Array(30).fill(0));

        // Cancel any existing animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Load and prepare the audio
        const loadAudio = async () => {
            try {
                console.log('MiniAudioPlayer: Loading audio from URL:', audioUrl);

                // Stop any currently playing audio before loading a new one
                audioPlayerService.stopCurrentAudio();

                // Process the URL to ensure it's playable
                const fullUrl = await AudioService.getAudioFile(audioUrl);
                setAudioFileUrl(fullUrl);

                // Set the source on the audio element
                audioElement.src = fullUrl;
                audioElement.load();

                // Set up audio visualization
                setupAudioVisualization();

                // Log success for debugging
                console.log('Audio loaded successfully with URL:', fullUrl);
            } catch (error) {
                console.error('Error loading audio:', error);
                setIsLoading(false);
            }
        };

        loadAudio();

        // Set up audio event listeners
        const handleCanPlay = () => {
            console.log('MiniAudioPlayer: Audio can now play');
            setIsLoading(false);
            if (audioElement.duration !== Infinity) {
                setDuration(audioElement.duration);
            }

            // Auto-play when loaded
            audioElement.play()
                .then(() => setIsPlaying(true))
                .catch(e => {
                    console.warn('Auto-play was prevented:', e);
                    setIsPlaying(false);
                });
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audioElement.currentTime);
            // Update progress percentage
            const percent = (audioElement.currentTime / Math.max(0.1, audioElement.duration)) * 100;
            setProgressPercent(percent);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            setProgressPercent(0);
        };

        const handleLoadedMetadata = () => {
            setDuration(audioElement.duration);
        };

        const handleError = (e: any) => {
            console.error('MiniAudioPlayer: Audio loading error:', e);
            setIsLoading(false);
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        audioElement.addEventListener('canplaythrough', handleCanPlay);
        audioElement.addEventListener('timeupdate', handleTimeUpdate);
        audioElement.addEventListener('ended', handleEnded);
        audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.addEventListener('error', handleError);
        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('pause', handlePause);

        return () => {
            // Clean up all event listeners
            audioElement.removeEventListener('canplaythrough', handleCanPlay);
            audioElement.removeEventListener('timeupdate', handleTimeUpdate);
            audioElement.removeEventListener('ended', handleEnded);
            audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioElement.removeEventListener('error', handleError);
            audioElement.removeEventListener('play', handlePlay);
            audioElement.removeEventListener('pause', handlePause);

            // Cancel any animation frames
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [audioUrl]);

    const setupAudioVisualization = async () => {
        try {
            // Create or get audio context and nodes using our service
            const { analyzer, audioContext } = audioPlayerService.createAudioContext();
            analyzerRef.current = analyzer;
            
            // Configure analyzer for time domain data (for level meter)
            analyzer.fftSize = 256;
            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            dataArrayRef.current = dataArray;
            
            // Start visualization loop
            startVisualization();
        } catch (err) {
            console.error('Error setting up audio visualization:', err);
        }
    };

    const startVisualization = () => {
        const updateLevelMeter = () => {
            animationFrameRef.current = requestAnimationFrame(updateLevelMeter);
            
            const analyzer = analyzerRef.current;
            const dataArray = dataArrayRef.current;
            
            if (!analyzer || !dataArray) return;
            
            // Get the time domain data
            analyzer.getByteTimeDomainData(dataArray);
            
            // Calculate RMS (root mean square) for a more accurate level display
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                // Convert to -1 to 1 range
                const amplitude = (dataArray[i] - 128) / 128;
                sum += amplitude * amplitude;
            }
            const rms = Math.sqrt(sum / dataArray.length);
            
            // Scale the RMS to get a good visual level (0-1)
            const scaledRMS = Math.min(1, rms * 2.5);
            
            // Create level bars - higher values in the middle, tapering to the sides
            const newLevels = Array(30).fill(0).map((_, i) => {
                // Create a bell curve effect with higher values in the middle
                const position = i / 30;
                const distanceFromCenter = Math.abs(position - 0.5) * 2; // 0 at center, 1 at edges
                const multiplier = 1 - Math.pow(distanceFromCenter, 2); // Higher in middle
                
                // Base height plus randomness if playing, scaled by RMS
                const baseHeight = isPlaying ? scaledRMS * multiplier : 0;
                
                // Add slight randomness for a more dynamic look when playing
                const randomness = isPlaying ? Math.random() * 0.2 : 0;
                
                return Math.max(0.05, baseHeight + randomness * baseHeight);
            });
            
            setAudioLevels(newLevels);
        };
        
        updateLevelMeter();
    };

    const formatTime = (time: number): string => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const togglePlayPause = () => {
        if (isLoading) return;

        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play()
                .catch(err => {
                    console.error('Error playing audio:', err);
                    setupAudioVisualization();
                    audioElement.play().catch(e => console.error('Retry failed:', e));
                });
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioElement.volume = newVolume;
    };

    const handleClosePlayer = () => {
        audioPlayerService.stopCurrentAudio();
        if (onClose) {
            onClose();
        }
    };

    const toggleVolumeSlider = () => {
        setShowVolumeSlider(!showVolumeSlider);
    };

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || isLoading || duration <= 0) return;
        
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const seekPercentage = clickX / rect.width;
        const seekTime = seekPercentage * duration;
        
        audioElement.currentTime = seekTime;
        setCurrentTime(seekTime);
        setProgressPercent(seekPercentage * 100);
    };

    const handleProgressDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || isLoading || duration <= 0) return;
        isDraggingRef.current = true;
        
        // Pause while dragging for better UX
        const wasPlaying = !audioElement.paused;
        if (wasPlaying) {
            audioElement.pause();
        }
        
        // Store the playing state to resume after drag
        const currentProgressThumb = e.currentTarget;
        currentProgressThumb.dataset.wasPlaying = wasPlaying.toString();
        
        // Initial position update
        handleProgressBarClick(e);
        
        // Add temporary document-wide event listeners for drag
        document.addEventListener('mousemove', handleProgressDragMove);
        document.addEventListener('mouseup', handleProgressDragEnd);
    };

    const handleProgressDragMove = (e: MouseEvent) => {
        if (!isDraggingRef.current || !progressBarRef.current) return;
        
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const seekPercentage = clickX / rect.width;
        
        // Update progress bar visually without changing playback yet
        setProgressPercent(seekPercentage * 100);
        setCurrentTime(seekPercentage * duration);
    };

    const handleProgressDragEnd = (e: MouseEvent) => {
        if (!isDraggingRef.current || !progressBarRef.current) return;
        
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const seekPercentage = clickX / rect.width;
        const seekTime = seekPercentage * duration;
        
        // Update the actual playback time
        audioElement.currentTime = seekTime;
        
        // Resume playback if it was playing before
        const progressThumb = document.querySelector('.progress-thumb') as HTMLElement;
        if (progressThumb && progressThumb.dataset.wasPlaying === 'true') {
            audioElement.play().catch(err => console.error('Error resuming playback:', err));
        }
        
        // Clean up
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleProgressDragMove);
        document.removeEventListener('mouseup', handleProgressDragEnd);
    };

    const handleDownloadAudio = async () => {
        if (!audioFileUrl) return;
        
        try {
            setIsDownloading(true);
            
            // If it's already a blob URL, download it directly
            if (audioFileUrl.startsWith('blob:')) {
                const response = await fetch(audioFileUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `audio-${Date.now()}.mp3`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // Otherwise use the AudioService to download it
                const audioId = audioUrl.split('/').pop() || 'audio';
                await AudioService.downloadAudio(audioId);
            }
            
        } catch (error) {
            console.error('Error downloading audio:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-gray-900 rounded-lg shadow-xl z-30 border border-gray-800 transition-all duration-300">
            {/* Modern Audio Player UI */}
            <div className="p-3 sm:p-4">
                {/* Audio level visualization */}
                <div className="h-12 mb-3 bg-gray-900 rounded-lg flex items-end justify-between px-1 overflow-hidden">
                    {audioLevels.map((level, i) => (
                        <div 
                            key={i}
                            className="w-1 rounded-t transition-all duration-75 ease-out"
                            style={{
                                height: `${Math.max(5, level * 100)}%`,
                                backgroundColor: getBarColor(level),
                                transform: `scaleY(${isPlaying ? 1 : 0.3})`,
                                opacity: isPlaying ? 1 : 0.5,
                            }}
                        />
                    ))}
                    
                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 rounded-lg">
                            <div className="flex flex-col items-center">
                                <svg className="animate-spin h-6 w-6 text-orange-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-white text-sm font-medium">Loading audio...</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Progress bar */}
                <div 
                    ref={progressBarRef}
                    className="h-1.5 w-full bg-gray-700 rounded-full mb-3 relative cursor-pointer"
                    onClick={handleProgressBarClick}
                >
                    <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    />
                    <div 
                        className="progress-thumb absolute top-1/2 h-3 w-3 rounded-full bg-white -translate-y-1/2 shadow-md -ml-1.5 hover:scale-125 transition-transform"
                        style={{ left: `${progressPercent}%` }}
                        onMouseDown={handleProgressDragStart}
                        data-was-playing="false"
                    />
                </div>
                
                {/* Controls row */}
                <div className="flex items-center">
                    {/* Play/Pause button */}
                    <button
                        onClick={togglePlayPause}
                        disabled={isLoading}
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-orange-500 hover:bg-orange-400 text-white disabled:opacity-50 focus:outline-none transition-all disabled:cursor-not-allowed"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 012 0v6a1 1 0 11-2 0V9zm4-1a1 1 0 00-1 1v6a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    {/* Time display */}
                    <div className="mx-3 text-sm font-medium text-white">
                        {formatTime(currentTime)} <span className="text-gray-400">/ {formatTime(duration)}</span>
                    </div>
                    
                    {/* Spacer */}
                    <div className="flex-grow" />
                    
                    {/* Download button */}
                    <button
                        onClick={handleDownloadAudio}
                        disabled={isLoading || isDownloading}
                        className="mr-2 p-2 text-gray-300 hover:text-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                        aria-label="Download audio"
                    >
                        {isDownloading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        )}
                    </button>

                    {/* Volume control */}
                    <div className="relative">
                        <button
                            onClick={toggleVolumeSlider}
                            className="p-2 text-gray-300 hover:text-white focus:outline-none transition-colors"
                            aria-label="Volume control"
                        >
                            {volume > 0.5 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            ) : volume > 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            )}
                        </button>
                        {showVolumeSlider && (
                            <div className="absolute right-0 -top-20 bg-gray-800 rounded p-3 shadow-lg z-50 w-36 transition-all">
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    aria-label="Volume slider"
                                />
                                <div className="mt-2 text-xs text-center text-gray-400">
                                    Volume: {Math.round(volume * 100)}%
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleClosePlayer}
                        className="ml-2 p-2 text-gray-400 hover:text-white transition-colors"
                        aria-label="Close player"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function to get color based on audio level
const getBarColor = (level: number): string => {
    if (level > 0.8) return '#ef4444'; // Red for high levels
    if (level > 0.6) return '#f97316'; // Orange for medium-high levels
    if (level > 0.3) return '#f59e0b'; // Amber for medium levels
    return '#16a34a'; // Green for low levels
};

export default MiniAudioPlayer;