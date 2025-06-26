import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
    userId: mongoose.Types.ObjectId;
    filename: string;
    originalName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    extractedText?: string;
    analysis?: object;
    summary?: string;
    createdAt: Date;
}

const DocumentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    extractedText: {
        type: String
    },
    analysis: {
        type: Object
    },
    summary: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
