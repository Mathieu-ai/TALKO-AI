import mongoose from 'mongoose';
import config from './config';

// Fix the function to properly connect to MongoDB
const connectToDatabase = async () => {
    try {
        // Add connection options with appropriate timeouts
        await mongoose.connect(config.mongo.db, {
            serverSelectionTimeoutMS: 30000, // Increase from default 10000ms
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            heartbeatFrequencyMS: 10000
        });
        console.log('Connected to MongoDB successfully');

        // Create collections if they don't exist
        const db = mongoose.connection.db;
        if (db) {
            const collections = ['users', 'conversations', 'messages', 'images', 'audio'];

            for (const collection of collections) {
                const exists = await db.listCollections({ name: collection }).hasNext();
                if (!exists) {
                    await db.createCollection(collection);
                    console.log(`Created collection: ${collection}`);
                }
            }
        }

        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export default connectToDatabase;
