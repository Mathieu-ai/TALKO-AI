import mongoose, { Schema, Document } from 'mongoose';
import { FeatureType } from '../types/featureTypes';

export interface IUserActivity extends Document {
    userId?: mongoose.Types.ObjectId;
    sessionId?: string;
    featureType: string;
    isAnonymous: boolean;
    timestamp: Date;
    resourceId?: mongoose.Types.ObjectId;
    resourceType?: string;
}

const UserActivitySchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    sessionId: {
        type: String,
        required: false
    },
    featureType: {
        type: String,
        required: true,
        enum: Object.values(FeatureType)
    },
    isAnonymous: {
        type: Boolean,
        required: true,
        default: false
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    resourceType: {
        type: String,
        required: false
    }
});

// Ensure we have either userId or sessionId
UserActivitySchema.pre('save', function (next) {
    if (!this.userId && !this.sessionId) {
        return next(new Error('Either userId or sessionId must be provided'));
    }
    next();
});

export default mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);
