import mongoose, { Document, Schema } from 'mongoose';

export interface Message {
    role: string;
    content: string;
    timestamp?: Date;
}

export interface ConversationDocument extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema({
    role: {
        type: String,
        required: true,
        enum: ['system', 'user', 'assistant']
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ConversationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'New Conversation'
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Conversation = mongoose.model<ConversationDocument>('Conversation', ConversationSchema);

export default Conversation;