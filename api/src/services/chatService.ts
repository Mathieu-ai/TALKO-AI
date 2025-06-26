import User from '../models/user';
import Conversation from '../models/conversation';
import Message from '../models/message';
// Import the OpenAI client from the config instead of initializing it directly
import { openai } from '../config/openai';

// In-memory storage for tracking free usage
const freeUsageTracker: { [ip: string]: { count: number, lastReset: Date } } = {};
const FREE_LIMIT = 5; // Number of free messages allowed per day
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if a non-authenticated user has reached their free usage limit
 * @param ip The IP address of the user
 * @returns True if the user has reached their limit, false otherwise
 */
export const hasReachedFreeLimit = async (ip: string): Promise<boolean> => {
    const now = new Date();

    // Initialize tracker for this IP if it doesn't exist
    if (!freeUsageTracker[ip]) {
        freeUsageTracker[ip] = {
            count: 0,
            lastReset: now
        };
    }

    // Reset counter if it's been more than the reset interval
    if (now.getTime() - freeUsageTracker[ip].lastReset.getTime() > RESET_INTERVAL) {
        freeUsageTracker[ip] = {
            count: 0,
            lastReset: now
        };
    }

    // Increment count and check if limit is reached
    freeUsageTracker[ip].count++;

    // If this is first check, return false but keep the incremented count
    if (freeUsageTracker[ip].count <= FREE_LIMIT) {
        return false;
    }

    // Over the limit
    return true;
};

export const createConversation = async (userId: string, title: string) => {
    try {
        const conversation = new Conversation({
            userId,
            title
        });

        await conversation.save();
        return conversation;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw new Error('Failed to create conversation');
    }
};

export const getConversations = async (userId: string) => {
    try {
        const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });
        return conversations;
    } catch (error) {
        console.error('Error getting conversations:', error);
        throw new Error('Failed to get conversations');
    }
};

export const getConversation = async (conversationId: string) => {
    try {
        if (!conversationId) {
            throw new Error('Conversation ID is required');
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        return conversation;
    } catch (error) {
        console.error('Error getting conversation:', error);
        throw new Error('Failed to get conversation');
    }
};

export const saveMessage = async (conversationId: string, content: string, isUser: boolean) => {
    try {
        if (!conversationId) {
            throw new Error('Conversation ID is required');
        }

        const message = new Message({
            conversationId,
            content,
            role: isUser ? 'user' : 'assistant',
            timestamp: new Date()
        });

        await message.save();

        // Update the conversation's updatedAt time
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        return message;
    } catch (error) {
        console.error('Error saving message:', error);
        throw new Error('Failed to save message');
    }
};

export const getMessages = async (conversationId: string) => {
    try {
        if (!conversationId) {
            throw new Error('Conversation ID is required');
        }

        const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
        return messages;
    } catch (error) {
        console.error('Error getting messages:', error);
        throw new Error('Failed to get messages');
    }
};

export const sendMessageToAI = async (conversationId: string, userMessage: string) => {
    try {
        if (!conversationId) {
            throw new Error('Conversation ID is required');
        }

        // Save the user message
        await saveMessage(conversationId, userMessage, true);

        // Get the conversation history to provide context
        const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });

        // Format messages for OpenAI
        const formattedMessages = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        // Add a system message at the beginning
        formattedMessages.unshift({
            role: 'system',
            content: 'You are a helpful assistant. Provide concise and accurate information.'
        });

        // Call the OpenAI API
        const aiResponse = await generateChatResponse(formattedMessages);

        // Save the AI response
        const aiMessage = await saveMessage(conversationId, aiResponse, false);

        return aiMessage;
    } catch (error) {
        console.error('Error sending message to AI:', error);
        throw new Error('Failed to get response from AI');
    }
};

export const deleteConversation = async (conversationId: string) => {
    try {
        if (!conversationId) {
            throw new Error('Conversation ID is required');
        }

        // Delete all messages in the conversation
        await Message.deleteMany({ conversationId });

        // Delete the conversation
        const conversation = await Conversation.findByIdAndDelete(conversationId);

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        return { success: true, message: 'Conversation deleted successfully' };
    } catch (error) {
        console.error('Error deleting conversation:', error);
        throw new Error('Failed to delete conversation');
    }
};

export const getAllConversations = async () => {
    try {
        const conversations = await Conversation.find().sort({ updatedAt: -1 });
        return conversations;
    } catch (error: unknown) {
        console.error('Error getting all conversations:', error);
        throw new Error('Failed to get all conversations');
    }
};

export const getConversationsByUser = async (userId: string) => {
    try {
        const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });
        return conversations;
    } catch (error: unknown) {
        console.error('Error getting conversations by user:', error);
        throw new Error('Failed to get conversations by user');
    }
};

export const updateConversation = async (conversationId: string, title: string) => {
    try {
        const conversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { title, updatedAt: new Date() },
            { new: true }
        );

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        return conversation;
    } catch (error: unknown) {
        console.error('Error updating conversation:', error);
        throw new Error('Failed to update conversation');
    }
};

// Fix the OpenAI API call
async function generateChatResponse (messages: any[]): Promise<string> {
    try {
        // Convert messages to the correct format for OpenAI
        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        })) as any;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: formattedMessages
        });

        return completion.choices[0].message.content || 'No response generated';
    } catch (error) {
        console.error('Error generating chat response:', error);
        throw error;
    }
}

export {
    generateChatResponse,
};