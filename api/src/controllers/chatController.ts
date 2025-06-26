import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import Conversation from '../models/conversation';
import Message from '../models/message';
import * as chatService from '../services/chatService';
import config from '../config/config';

const openai = new OpenAI({
    apiKey: config.openai.apiKey,
});

export const sendMessage = async (req: any, res: Response) => {
    try {
        const { message, messages, conversationId } = req.body;

        // Check if non-authenticated user has reached free usage limit
        if (!req.user._id && await chatService.hasReachedFreeLimit(req.ip)) {
            // Calculate a timestamp 24 hours from now
            const retryAfter = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            return res.status(403).json({
                error: 'Free usage limit reached',
                message: 'Please log in to continue using the chat feature',
                retryAfter // Add timestamp when client should check again
            });
        }

        // Process the message with OpenAI
        const response = await openai.chat.completions.create({
            model: process.env.CHAT_MODEL || 'gpt-3.5-turbo',
            messages: messages || [{ role: 'user', content: message }],
        });

        const aiResponse = response.choices[0].message.content;

        // Save conversation if user is authenticated
        if (req.user._id) {
            let conversation;

            if (conversationId) {
                conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    // Create a new conversation if ID not found
                    conversation = new Conversation({
                        userId: req.user._id,
                        title: messages?.[0]?.content.substring(0, 30) || message.substring(0, 30),
                    });
                    await conversation.save();
                }
            } else {
                // Create a new conversation
                conversation = new Conversation({
                    userId: req.user._id,
                    title: messages?.[0]?.content.substring(0, 30) || message.substring(0, 30),
                });
                await conversation.save();
            }

            // Create and save the user message
            const userMsg = new Message({
                conversationId: conversation._id,
                role: 'user',
                content: message || messages[messages.length - 1].content,
            });
            await userMsg.save();

            // Create and save the AI message
            const aiMsg = new Message({
                conversationId: conversation._id,
                role: 'assistant',
                content: aiResponse,
            });
            await aiMsg.save();

            await Conversation.findByIdAndUpdate(
                conversation._id,
                { $push: { messages: { $each: [userMsg._id, aiMsg._id] } } },
                { new: true }
            );

            return res.json({
                id: aiMsg._id,
                response: aiResponse,
                conversationId: conversation._id
            });
        }

        // For non-authenticated users, just return the response without saving
        return res.json({
            response: aiResponse
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};

export const getConversationHistory = async (req: any, res: Response) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });
        res.json(conversations);
    } catch (error) {
        console.error('Error in getConversationHistory:', error);
        res.status(500).json({ error: 'Failed to retrieve conversation history' });
    }
};

export const getConversation = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const conversation = await Conversation.findById(id).populate('messages');
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Verify ownership
        if (conversation.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(conversation);
    } catch (error) {
        console.error('Error in getConversation:', error);
        res.status(500).json({ error: 'Failed to retrieve conversation' });
    }
};

export const deleteConversation = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Verify ownership
        if (conversation.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Delete associated messages
        await Message.deleteMany({ conversationId: id });

        // Delete the conversation
        await Conversation.findByIdAndDelete(id);

        res.json({ success: true, message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error in deleteConversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
};