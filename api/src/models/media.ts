import mongoose, { Document, Schema } from 'mongoose';

export type MediaType = 'image' | 'audio' | 'document';

export interface Media {
    id: string;
    userId: string;
    conversationId?: string;
    type: MediaType;
    fileName: string;
    filePath: string;
    url?: string;
    mimeType: string;
    size: number;
    metadata?: Record<string, any>;
    createdAt: Date;
}

export interface MediaDocument extends Media, Omit<Document, 'id'> {
    // Add any instance methods here
}

const mediaSchema = new Schema<MediaDocument>({
    id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    conversationId: {
        type: String,
        index: true
    },
    type: {
        type: String,
        enum: ['image', 'audio', 'document'],
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    url: {
        type: String
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    metadata: {
        type: Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model
export const MediaModel = mongoose.model<MediaDocument>('Media', mediaSchema);

// Media repository for database operations
export class MediaRepository {
    async createMedia (mediaData: Omit<Media, 'id' | 'createdAt'>): Promise<Media> {
        const newMedia = new MediaModel({
            id: new mongoose.Types.ObjectId().toString(),
            ...mediaData
        });

        await newMedia.save();
        return newMedia.toObject();
    }

    async getMediaById (id: string): Promise<Media | null> {
        return await MediaModel.findOne({ id }).lean();
    }

    async getUserMedia (userId: string, type?: MediaType): Promise<Media[]> {
        const query: any = { userId };
        if (type) query.type = type;

        return await MediaModel.find(query).sort({ createdAt: -1 }).lean();
    }

    async getConversationMedia (conversationId: string): Promise<Media[]> {
        return await MediaModel.find({ conversationId }).sort({ createdAt: -1 }).lean();
    }

    async deleteMedia (id: string): Promise<boolean> {
        const result = await MediaModel.deleteOne({ id });
        return result.deletedCount === 1;
    }
}
