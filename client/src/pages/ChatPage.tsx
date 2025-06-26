import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import ChatMessage from '../components/chat/ChatMessage';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import LoginPrompt from '../components/LoginPrompt';
import { Link } from 'react-router-dom';

const ChatPage: React.FC = () => {
    const { messages, sendMessage, clearChat, loading, error } = useChat();
    const [input, setInput] = useState('');
    const { isAuthenticated } = useAuth();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Check if user is authenticated or if we should show login prompt
        if (!isAuthenticated && messages.length >= 5) {
            setShowLoginPrompt(true);
            return;
        }

        await sendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 px-6 flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Talko AI Chat</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Have a conversation with our AI assistant</p>
            </div>

            {/* Information box for non-logged-in users */}
            {!isAuthenticated && (
                <div className="mx-4 mt-4 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-primary-300 mb-2">Limited Access</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        You are using Talko AI as a guest.
                        <Link to="/login" className="underline font-medium ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                            Log in
                        </Link> or
                        <Link to="/register" className="underline font-medium ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                            sign up
                        </Link> for full access to all features, unlimited messages, and to save your conversation history.
                    </p>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>• As a guest, you're limited to 5 messages per conversation</p>
                        <p>• Your conversations are not saved when you leave</p>
                    </div>
                </div>
            )}

            {/* Messages Container - add relative positioning and make it fill available space */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-full p-4 mb-4">
                            <span className="text-3xl">🤖</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-2">Start a Conversation</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                            Ask me anything - I can help with information, creative ideas, problem-solving, and more!
                        </p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <ChatMessage
                            key={index}
                            text={msg.text}
                            isUser={msg.sender === 'user'}
                        />
                    ))
                )}
                <div ref={endOfMessagesRef} />

                {/* Show error message if there is one */}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/60 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Login prompt if needed */}
                {showLoginPrompt && (
                    <div className="my-6">
                        <LoginPrompt feature="chat" message="You've reached the limit of messages in free mode. Sign in to continue your conversation." />
                    </div>
                )}
            </div>

            {/* Input Area - ensure it doesn't grow or shrink */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading || showLoginPrompt}
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!input.trim() || loading || showLoginPrompt}
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </form>
                {loading && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 animate-pulse">
                        AI is thinking...
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
