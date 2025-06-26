import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prompt: {
        type: String
    },
    imageUrl: {
        type: String,
        required: true
    },
    fileName: String,
    generatedAt: {
        type: Date,
        default: Date.now
    },
    isGenerated: {
        type: Boolean,
        default: false
    }
});

const Image = mongoose.model('Image', imageSchema);
export default Image;
