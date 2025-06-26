import { AudioOptions } from "../types/audio";
import { api, axiosInstance } from "./api";

export default class ApiService {
    constructor() {
        // No need to inject api, always use imported api
    }

    public async generateSpeech(text: string, options: AudioOptions = { voice: 'alloy' }): Promise<any> {
        // Remove the duplicate /api in the endpoint path
        return api('audio/generate-speech', { text, ...options }, 'POST');
    }

    public async transcribeSpeech(audioData: FormData): Promise<any> {
        return api('audio/transcribe', audioData, 'POST', {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    public async getAudioHistory(): Promise<any> {
        return api('audio/history', {}, 'GET');
    }

    public async getSpeechToTextHistory(): Promise<any> {
        return api('audio/speech-to-text-history', {}, 'GET');
    }

    public async deleteAudioHistoryItem(audioId: string): Promise<any> {
        return api(`audio/delete/${audioId}`, {}, 'DELETE');
    }

    public async getAudioFile(audioPath: string): Promise<string> {
        // If it's already a full URL or blob URL, return it as is
        if (audioPath.startsWith('http') || audioPath.startsWith('blob:')) {
            return audioPath;
        }
        // Extract just the filename if a path is provided
        const fileName = audioPath.includes('/') ? audioPath.split('/').pop() : audioPath;
        // Use the correct streaming endpoint format (avoid duplicate api/)
        const endpoint = `audio/stream/${fileName}`;
        // Use axiosInstance directly for blob response
        const response = await axiosInstance.get(endpoint, {
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    }

    public async getPlayStatus(audioUrl: string): Promise<boolean> {
        try {
            if (audioUrl.startsWith('blob:')) {
                return true;
            }
            if (audioUrl.startsWith('/')) {
                // Use axiosInstance for HEAD request
                const response = await axiosInstance.head(audioUrl);
                return response.status === 200;
            }
            return true;
        } catch (error) {
            console.error('Error checking audio status:', error);
            return false;
        }
    }
}