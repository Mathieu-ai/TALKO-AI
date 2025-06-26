import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// File types enum - matches API's MediaType
export type FileType = 'image' | 'audio' | 'document';

// Interface for uploaded file response
export interface UploadedFile {
    id: string;
    userId: string;
    conversationId?: string;
    type: FileType;
    fileName: string;
    filePath: string;
    url?: string;
    mimeType: string;
    size: number;
    metadata?: Record<string, any>;
    createdAt: Date;
}

/**
 * Upload a file to the server
 * This uses the API's file size limit (50MB) defined in uploadMiddleware
 */
export const uploadFile = async (
    file: File,
    userId: string,
    type: FileType,
    conversationId?: string
): Promise<UploadedFile> => {
    // Create form data
    const formData = new FormData();
    formData.append('file', file); // <-- Ensure this is 'file'
    formData.append('userId', userId);
    formData.append('type', type);

    if (conversationId) {
        formData.append('conversationId', conversationId);
    }

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/media/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 413) {
            throw new Error('File is too large. Maximum size is 50MB.');
        }
        throw error;
    }
};

/**
 * Fetch files for a user
 */
export const getUserFiles = async (
    userId: string,
    type?: FileType
): Promise<UploadedFile[]> => {
    try {
        const url = type
            ? `${API_BASE_URL}/api/media/user/${userId}?type=${type}`
            : `${API_BASE_URL}/api/media/user/${userId}`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching user files:', error);
        throw error;
    }
};

/**
 * Fetch files for a conversation
 */
export const getConversationFiles = async (
    conversationId: string
): Promise<UploadedFile[]> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/media/conversation/${conversationId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching conversation files:', error);
        throw error;
    }
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string): Promise<boolean> => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/media/${fileId}`);
        return response.data.success;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};
