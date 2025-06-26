import React from 'react';

interface ChatMessageProps {
    text: string;
    isUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, isUser }) => {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-800 dark:text-primary-200 text-xs font-bold">AI</span>
                    </div>
                </div>
            )}

            <div 
                className={`max-w-[75%] rounded-xl px-4 py-3 ${
                    isUser 
                        ? 'bg-primary-600 dark:bg-primary-700 text-white' 
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200'
                }`}
            >
                <p className="whitespace-pre-wrap text-sm md:text-base">{text}</p>
                <div className={`text-xs mt-1 ${isUser ? 'text-primary-200 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'} text-right`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {isUser && (
                <div className="flex-shrink-0 ml-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-700 dark:text-gray-200 text-xs font-bold">You</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
