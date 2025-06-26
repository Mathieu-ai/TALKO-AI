import { useState, useCallback } from 'react';
import { api } from '../services/api';

export interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp?: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    // Add user message to state immediately
    const userMessage: Message = {
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      const response = await api('chat/send', { message: text });
      
      if (response.response) {
        const aiMessage: Message = {
          text: response.response,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        return true;
      } else {
        setError(response.response || 'Failed to get response');
        return false;
      }
    } catch (err) {
      setError('An error occurred while sending your message');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, clearChat, loading, error };
}
