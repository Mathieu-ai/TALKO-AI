import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const analyzeDocument = async (file: File, prompt?: string): Promise<string> => {
    const formData = new FormData();
    // Change field name from 'file' to 'document' to match server's multer configuration
    formData.append('document', file);
    
    if (prompt) {
        formData.append('prompt', prompt);
    }

    try {
        const token = localStorage.getItem('talko_token');
        
        const response = await axios.post(`${API_URL}/documents/analyze`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token ? `Bearer ${token}` : '',
            },
        });

        return response.data.analysis || response.data.result;
    } catch (error) {
        console.error('Error analyzing document:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to analyze document');
        }
        throw new Error('Failed to analyze document');
    }
};

export const summarizeDocument = async (file: File): Promise<string> => {
    const formData = new FormData();
    // Change field name from 'file' to 'document' to match server's multer configuration
    formData.append('document', file);

    try {
        const token = localStorage.getItem('talko_token');
        
        const response = await axios.post(`${API_URL}/documents/summarize`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token ? `Bearer ${token}` : '',
            },
        });

        return response.data.summary || response.data.result;
    } catch (error) {
        console.error('Error summarizing document:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to summarize document');
        }
        throw new Error('Failed to summarize document');
    }
};
