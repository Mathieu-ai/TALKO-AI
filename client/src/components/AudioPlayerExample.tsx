import React, { useState, useEffect, useRef } from 'react';
import audioService from '../services/audioService';

interface AudioPlayerProps {
  audioPath: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioPath }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        setIsLoading(true);
        const url = await audioService.getAuthenticatedAudioUrl(audioPath);
        setAudioUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load audio:', err);
        setError('Failed to load audio file');
        setIsLoading(false);
      }
    };

    loadAudio();

    // Clean up the object URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioPath]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  if (isLoading) return <div>Loading audio...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioUrl || ''} controls />
      <button onClick={handlePlay}>Play</button>
    </div>
  );
};

export default AudioPlayer;
