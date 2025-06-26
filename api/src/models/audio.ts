import mongoose from 'mongoose';

const audioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: String,
    audioUrl: String,
    fileName: String,
    type: {
        type: String,
        enum: ['text-to-speech', 'speech-to-text'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Audio = mongoose.model('Audio', audioSchema);
export default Audio;
