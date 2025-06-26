import React, { useState, useEffect } from 'react';
import { checkUsageLimit, incrementUsage } from '../../utils/usageRestrictions';
import LoginPrompt from '../LoginPrompt';
import { FeatureName } from '../../types/chat';

interface DocumentUploadProps {
    isLoggedIn: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ isLoggedIn }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [canUpload, setCanUpload] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    useEffect(() => {
        // Check if user can upload documents based on login status and usage
        const checkDocumentUsage = () => {
            const canUseDocuments = checkUsageLimit('documentProcessing' as FeatureName, isLoggedIn);
            setCanUpload(canUseDocuments);
        };

        checkDocumentUsage();
    }, [isLoggedIn]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !canUpload) return;

        setUploadStatus('uploading');
        setError(null);

        try {
            // Create a FormData object
            const formData = new FormData();
            // Update field name to 'document' to match server expectation
            formData.append('document', file);

            // API call to upload and process document
            // const response = await processDocument(formData);
            // setResult(response.processedText);

            // Mock document processing for demonstration
            setTimeout(() => {
                setResult(`Processed content from ${file.name}:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.`);

                // If user is not logged in, increment usage and check if they've reached the limit
                if (!isLoggedIn) {
                    incrementUsage('documentProcessing' as FeatureName);
                    setCanUpload(checkUsageLimit('documentProcessing' as FeatureName, isLoggedIn));
                }

                setUploadStatus('success');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to process document');
            setUploadStatus('error');
        }
    };

    return (
        <div className="document-upload p-4">
            <h2 className="text-2xl font-bold mb-4">Document Processing</h2>

            <div className="mb-4">
                <label className="block mb-2 font-medium">Upload Document</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="w-full p-2 border border-gray-300 rounded"
                    disabled={!canUpload || uploadStatus === 'uploading'}
                />
                <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOCX, TXT</p>
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || uploadStatus === 'uploading' || !canUpload}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {uploadStatus === 'uploading' ? 'Processing...' : 'Process Document'}
            </button>

            {error && (
                <div className="text-red-500 mt-2">{error}</div>
            )}

            {!canUpload && !isLoggedIn && (
                <LoginPrompt feature="document processing" />
            )}

            {result && (
                <div className="mt-4">
                    <h3 className="text-xl font-medium mb-2">Processed Result</h3>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;
