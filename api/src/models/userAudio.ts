import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAudio extends Document {
    userId: mongoose.Types.ObjectId;
    type: string;
    text?: string;
    audioUrl?: string;
    duration?: number;
    confidence?: number;
    createdAt: Date;
}

const UserAudioSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text_to_speech', 'speech_to_text'],
        required: true
    },
    text: {
        type: String,
        required: false
    },
    audioUrl: {
        type: String,
        required: false
    },
    duration: {
        type: Number,
        required: false
    },
    confidence: {
        type: Number,
        required: false,
        default: 1.0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for faster querying
UserAudioSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IUserAudio>('UserAudio', UserAudioSchema);
