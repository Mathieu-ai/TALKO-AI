import React, { useState, useEffect } from 'react';
import useDocumentProcessing from '../hooks/useDocumentProcessing';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useFeatureLimits } from '../hooks/useFeatureLimits';
import ReactMarkdown from 'react-markdown';

const DocumentPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const { analyzeDocument, summarizeDocument, loading, error: processingError } = useDocumentProcessing();
    const { user } = useAuth();
    const { limits, getRemainingFor } = useFeatureLimits();
    const isLoggedIn = !!user;
    const [showCopyToast, setShowCopyToast] = useState(false);

    // Limit tracking state
    const [remainingUploads, setRemainingUploads] = useState<number | null>(null);
    const [limitLoading, setLimitLoading] = useState(true);
    const [limitReachedTimestamp, setLimitReachedTimestamp] = useState<number | null>(() => {
        // Check if we have a stored timestamp
        const storedTimestamp = localStorage.getItem('documentLimitReachedAt');
        return storedTimestamp ? parseInt(storedTimestamp, 10) : null;
    });

    useEffect(() => {
        const fetchRemainingUsage = async () => {
            if (isLoggedIn) return; // Logged in users have unlimited access

            // Check if we need to wait because limit was reached less than 24h ago
            const now = Date.now();
            if (limitReachedTimestamp && now - limitReachedTimestamp < 24 * 60 * 60 * 1000) {
                setRemainingUploads(0); // Still in cooldown period
                setLimitLoading(false);
                return;
            }

            try {
                setLimitLoading(true);
                const remaining = await getRemainingFor('documentProcessing');
                setRemainingUploads(remaining);

                // If limit reached, store the timestamp
                if (remaining <= 0) {
                    const timestamp = Date.now();
                    setLimitReachedTimestamp(timestamp);
                    localStorage.setItem('documentLimitReachedAt', timestamp.toString());
                } else if (limitReachedTimestamp) {
                    // If we had a limit before but now we have uploads available, clear the timestamp
                    setLimitReachedTimestamp(null);
                    localStorage.removeItem('documentLimitReachedAt');
                }
            } catch (error) {
                console.error('Error fetching remaining document processing usage:', error);
            } finally {
                setLimitLoading(false);
            }
        };

        fetchRemainingUsage();
        // Only fetch on component mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    const documentLimit = limits?.documentProcessing || 1; // Default to 1 for document processing
    const hasReachedLimit = !isLoggedIn && remainingUploads !== null && remainingUploads <= 0;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || hasReachedLimit) return;

        try {
            console.log('Submitting file:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            const result = await analyzeDocument(file, prompt);
            setResult(result);

            // Update limit tracking after successful operation (if not logged in)
            if (!isLoggedIn) {
                const newRemaining = remainingUploads !== null ? Math.max(0, remainingUploads - 1) : null;
                setRemainingUploads(newRemaining);

                if (newRemaining === 0) {
                    const timestamp = Date.now();
                    setLimitReachedTimestamp(timestamp);
                    localStorage.setItem('documentLimitReachedAt', timestamp.toString());
                }
            }
        } catch (error: any) {
            console.error('Error during document analysis:', error);
            
            if (error.response?.status === 403 && error.response?.data?.error === 'Usage limit reached') {
                const timestamp = Date.now();
                setLimitReachedTimestamp(timestamp);
                localStorage.setItem('documentLimitReachedAt', timestamp.toString());
                setRemainingUploads(0);
            }
        }
    };

    const handleSummarize = async () => {
        if (!file || hasReachedLimit) return;

        try {
            const result = await summarizeDocument(file);
            setResult(result);

            // Update limit tracking after successful operation (if not logged in)
            if (!isLoggedIn) {
                const newRemaining = remainingUploads !== null ? Math.max(0, remainingUploads - 1) : null;
                setRemainingUploads(newRemaining);

                if (newRemaining === 0) {
                    const timestamp = Date.now();
                    setLimitReachedTimestamp(timestamp);
                    localStorage.setItem('documentLimitReachedAt', timestamp.toString());
                }
            }
        } catch (error: any) {
            if (error.response?.status === 403 && error.response?.data?.error === 'Usage limit reached') {
                const timestamp = Date.now();
                setLimitReachedTimestamp(timestamp);
                localStorage.setItem('documentLimitReachedAt', timestamp.toString());
                setRemainingUploads(0);
            }
        }
    };

    const handleCopyResult = () => {
        navigator.clipboard.writeText(result);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000); // Hide toast after 2 seconds
    };

    // Format the time remaining until reset if limit has been reached
    const getTimeUntilReset = (): string => {
        if (!limitReachedTimestamp) return '';

        const now = Date.now();
        const timePassedMs = now - limitReachedTimestamp;
        const timeRemainingMs = Math.max(0, 24 * 60 * 60 * 1000 - timePassedMs);

        if (timeRemainingMs <= 0) return 'Refreshing soon';

        const hours = Math.floor(timeRemainingMs / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemainingMs % (60 * 60 * 1000)) / (60 * 1000));

        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="container mx-auto p-4 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4">Document Processing</h1>

            {!isLoggedIn && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-lg font-medium text-yellow-800">Free User Limits</h3>
                    <p className="text-yellow-700">
                        {limitLoading ? (
                            "Loading usage limits..."
                        ) : (
                            <>
                                You can process {documentLimit} document per day as a guest user.
                                {remainingUploads !== null && (
                                    hasReachedLimit ? (
                                        <span> Limit reached. Available again in: {getTimeUntilReset()}</span>
                                    ) : (
                                        <span> You have {remainingUploads} document processing attempts remaining.</span>
                                    )
                                )}
                            </>
                        )}
                    </p>
                    <p className="mt-2">
                        <Link to="/login" className="text-blue-600 hover:underline font-medium">
                            Log in
                        </Link> or{' '}
                        <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                            Sign up
                        </Link>{' '}
                        for unlimited access.
                    </p>
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document
                </label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={hasReachedLimit}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt (Optional for Analysis)
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder={hasReachedLimit ? "Daily limit reached. Please log in to continue." : "Enter your questions or instructions about the document..."}
                    disabled={hasReachedLimit}
                />
            </div>

            <div className="flex space-x-2 mb-6">
                <button
                    onClick={handleAnalyze}
                    disabled={!file || loading || hasReachedLimit}
                    className={`${hasReachedLimit ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md disabled:opacity-50`}
                >
                    {hasReachedLimit ? 'Limit Reached' : 'Analyze Document'}
                </button>
                <button
                    onClick={handleSummarize}
                    disabled={!file || loading || hasReachedLimit}
                    className={`${hasReachedLimit ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-md disabled:opacity-50`}
                >
                    {hasReachedLimit ? 'Limit Reached' : 'Summarize Document'}
                </button>
            </div>

            {loading && <div className="text-center py-3">Processing document...</div>}

            {processingError && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                    {processingError}
                </div>
            )}

            {result && (
                <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden transition-colors duration-200">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analysis Result</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {file?.name} • {new Date().toLocaleDateString()}
                            </p>
                        </div>
                        <button 
                            onClick={handleCopyResult}
                            className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                            title="Copy to clipboard"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            
                            {showCopyToast && (
                                <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-md shadow-md animate-fade-in-out whitespace-nowrap">
                                    Copied content!
                                </div>
                            )}
                        </button>
                    </div>
                    <div className="p-5 bg-white dark:bg-gray-800 transition-colors duration-200">
                        <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 overflow-auto">
                                <div className="markdown-content">
                                    <ReactMarkdown>
                                        {result}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Powered by Talko AI Document Analysis
                            </span>
                            <button 
                                onClick={() => setResult('')}
                                className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                Clear Result
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
                .animate-fade-in-out {
                    animation: fadeInOut 2s ease-in-out;
                }
                .markdown-content {
                    font-family: inherit;
                }
                .markdown-content p {
                    margin-bottom: 1rem;
                }
                .markdown-content h1, .markdown-content h2, .markdown-content h3, 
                .markdown-content h4, .markdown-content h5, .markdown-content h6 {
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                }
                .markdown-content ul, .markdown-content ol {
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .markdown-content li {
                    margin-bottom: 0.5rem;
                }
                .markdown-content code {
                    background-color: rgba(0, 0, 0, 0.05);
                    padding: 0.2rem 0.4rem;
                    border-radius: 3px;
                    font-size: 0.9em;
                }
                .markdown-content pre {
                    background-color: rgba(0, 0, 0, 0.05);
                    padding: 1rem;
                    border-radius: 5px;
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }
                .markdown-content blockquote {
                    border-left: 4px solid #ddd;
                    padding-left: 1rem;
                    margin-left: 0;
                    color: #666;
                }
                .dark .markdown-content blockquote {
                    border-left-color: #444;
                    color: #aaa;
                }
                .markdown-content a {
                    color: #3182ce;
                    text-decoration: underline;
                }
                .markdown-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 1rem;
                }
                .markdown-content th, .markdown-content td {
                    border: 1px solid #ddd;
                    padding: 0.5rem;
                }
                .dark .markdown-content th, .dark .markdown-content td {
                    border-color: #444;
                }
                .markdown-content th {
                    background-color: rgba(0, 0, 0, 0.05);
                }
            `}</style>
        </div>
    );
};

export default DocumentPage;
