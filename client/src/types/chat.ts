export interface ChatMessage {
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export interface Conversation {
    id: string;
    userId: string;
    messages: ChatMessage[];
}

// Add a type for feature limits tracking
export interface FeatureUsage {
    conversations: number;
    images: number;
    textToSpeech: number;
    speechToText: number;
    documentProcessing: number;
    conversation: number;
    chat: number;
}

// Add a type for feature names
export type FeatureName = keyof FeatureUsage;

// History item interface for displaying user activity
export interface HistoryItem {
    id: string;
    type: 'conversation' | 'audio' | 'image' | 'document';
    title: string;
    preview: string;
    timestamp: Date;
    url?: string;
}
