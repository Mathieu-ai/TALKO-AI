import React, { useState, useEffect } from 'react';
import { checkUsageLimit, incrementUsage, getUsageRemaining } from '../../utils/usageRestrictions';
import LoginPrompt from '../LoginPrompt';
import { FeatureName } from '../../types/chat';

export interface ChatComponentProps {
    isLoggedIn: boolean;
    // other props as needed
}

const ChatComponent: React.FC<ChatComponentProps> = ({ isLoggedIn }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: string, content: string }>>([]);
    const [canSendMessage, setCanSendMessage] = useState(true);

    useEffect(() => {
        // Check if user can send messages based on login status and usage
        const checkChatUsage = () => {
            const canUseChat = checkUsageLimit('chat' as FeatureName, isLoggedIn);
            setCanSendMessage(canUseChat);
        };

        checkChatUsage();
    }, [isLoggedIn]);

    const handleSendMessage = async () => {
        if (!message.trim() || !canSendMessage) return;

        // Add user message to chat
        const userMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            // Call API to get response
            // const response = await fetchChatResponse(message);

            // Add AI response to chat
            // setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);

            // If user is not logged in, increment usage and check if they've reached the limit
            if (!isLoggedIn) {
                incrementUsage('chat' as FeatureName);
                setCanSendMessage(checkUsageLimit('chat' as FeatureName, isLoggedIn));
            }

            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            // Handle error
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-history">
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`chat-message ${chat.role}`}>
                        {chat.content}
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!canSendMessage}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || !canSendMessage}
                >
                    Send
                </button>
            </div>

            {!canSendMessage && !isLoggedIn && (
                <LoginPrompt feature="chat" />
            )}
        </div>
    );
};

export default ChatComponent;
