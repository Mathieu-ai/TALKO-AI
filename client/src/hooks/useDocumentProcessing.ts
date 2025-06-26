import { useState } from 'react';
import { analyzeDocument as analyzeDocumentService, summarizeDocument as summarizeDocumentService } from '../services/documentService';

interface UseDocumentProcessingReturn {
    analyzeDocument: (file: File, prompt?: string) => Promise<string>;
    summarizeDocument: (file: File) => Promise<string>;
    processDocument: (file: File) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const useDocumentProcessing = (): UseDocumentProcessingReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeDocument = async (file: File, prompt?: string): Promise<string> => {
        setLoading(true);
        setError(null);

        try {
            const result = await analyzeDocumentService(file, prompt);
            return result;
        } catch (error: any) {
            console.error('Error analyzing document:', error);
            const errorMessage = error.message || 'Failed to analyze document';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const summarizeDocument = async (file: File): Promise<string> => {
        setLoading(true);
        setError(null);

        try {
            const result = await summarizeDocumentService(file);
            return result;
        } catch (error: any) {
            console.error('Error summarizing document:', error);
            const errorMessage = error.message || 'Failed to summarize document';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const processDocument = async (file: File): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            // This can remain as is, or be implemented if needed
            const formData = new FormData();
            formData.append('file', file);
            // Implementation based on your needs
            setLoading(false);
        } catch (error: any) {
            console.error('Error processing document:', error);
            const errorMessage = error.message || 'Failed to process document';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        analyzeDocument,
        summarizeDocument,
        processDocument,
        loading,
        error,
    };
};

export default useDocumentProcessing;
