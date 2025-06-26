export interface AudioRequest {
    audioFile: Buffer;
    userId: string;
}

export interface LiveTranscriptionRequest {
    audioStream: NodeJS.ReadableStream;
    userId: string;
}

export interface ChatRequest {
    message: string;
    userId: string;
}

export interface DocumentRequest {
    documentFile: Buffer;
    userId: string;
}

export interface ImageGenerationRequest {
    prompt: string;
    userId: string;
}

export interface Conversation {
    id: string;
    userId: string;
    messages: Array<ChatMessage>;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export interface User {
    id: string;
    name: string;
    sessionId: string;
}