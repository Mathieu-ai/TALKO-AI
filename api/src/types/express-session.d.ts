import 'express-session';

declare module 'express-session' {
    interface SessionData {
        isAuthenticated?: boolean;
        userId?: string;
        usage?: {
            conversations: number;
            images: number;
            textToSpeech: number;
            speechToText: number;
            documentProcessing: number;
            conversation: number;
            chat: number;
        };
        user?: any;
        anonymousSessionId?: string;
    }
}
