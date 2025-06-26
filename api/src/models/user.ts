import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define interface for methods separately
interface UserMethods {
    comparePassword (candidatePassword: string): Promise<boolean>;
}

// Update the UserDocument to use the methods interface
export interface UserDocument extends Document, UserMethods {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

// Updated schema declaration with types for methods
const userSchema = new Schema<UserDocument, mongoose.Model<UserDocument>, UserMethods>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add password hashing middleware
userSchema.pre('save', async function (next) {
    // This should now be properly typed
    const user = this;

    // Only hash the password if it's modified or new
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Add the comparePassword method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Use _id instead of id
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Don't expose password
        return ret;
    }
});

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;