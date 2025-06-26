import connectToDatabase from "../config/database";

export const initDatabase = async () => {
    try {
        await connectToDatabase();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};

export default initDatabase;
