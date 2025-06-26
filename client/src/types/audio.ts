export interface AudioOptions {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    model?: 'tts-1' | 'tts-1-hd';
}

export interface TranscriptionResult {
    text: string;
    confidence: number;
    segments?: Array<{
        start: number;
        end: number;
        text: string;
    }>;
}

// New interfaces for audio player
export interface AudioPlayerProps {
    audioUrl: string;
    imageUrl?: string;
    title?: string;
    onClose: () => void;
}

export interface WaveformData {
    data: number[];
    duration: number;
}

// New export format types
export type TranscriptionExportFormat = 'txt' | 'json' | 'srt' | 'vtt';

// Interface for export format selection
export interface ExportFormatOption {
    value: TranscriptionExportFormat;
    label: string;
    icon: string; // Class name for icon
    description: string;
}

// Interface for download options
export interface DownloadOptions {
    format: TranscriptionExportFormat;
    includeTimestamps?: boolean;
    includeMetadata?: boolean;
}

// Interface for audio history items
export interface AudioHistoryItem {
    id: string;
    text?: string;
    audioUrl: string;
    type: 'text-to-speech' | 'speech-to-text';
    createdAt: string;
    // Added for UI display
    title?: string;
    date?: string;
    // Add other properties as needed
}

// Speech-to-text specific interfaces
export interface SpeechToTextResult {
    success: boolean;
    text: string;
    transcription: string;
    confidence: number;
}
