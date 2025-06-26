import app from './app';
import connectToDatabase from './config/database';
import performHealthCheck from './utils/healthCheck';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Perform health check before starting the server
        console.log('Performing pre-startup health check...');
        const healthCheckPassed = await performHealthCheck();

        if (!healthCheckPassed) {
            console.error('Server startup aborted due to failed health check');
            process.exit(1);
        }

        // Ensure database is connected before starting the server
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
