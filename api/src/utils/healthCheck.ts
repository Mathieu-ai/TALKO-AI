import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../config/database';

/**
 * Performs health checks before server starts
 * - Database connection
 * - Required dependencies
 * - System readiness
 */
export const performHealthCheck = async (): Promise<boolean> => {
    console.log('Starting system health check...');

    try {
        // Check database connection
        await checkDatabaseConnection();

        // Check dependencies
        checkDependencies();

        console.log('✅ All health checks passed successfully');
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return false;
    }
};

/**
 * Verifies database connection is working properly
 */
const checkDatabaseConnection = async (): Promise<void> => {
    console.log('Checking database connection...');

    try {
        // Try to connect to the database
        await connectToDatabase();

        // Verify connection state
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not active');
        }

        // Check if db property exists before using it
        if (!mongoose.connection.db) {
            throw new Error('Database instance is not available');
        }

        // Try a simple ping operation
        await mongoose.connection.db.admin().ping();

        console.log('✅ Database connection verified');
    } catch (error) {
        console.error('❌ Database connection check failed:', error);
        throw new Error('Database connection check failed');
    }
};

/**
 * Verifies required dependencies are installed
 */
const checkDependencies = (): void => {
    console.log('Checking dependencies...');

    const requiredDependencies = ['mongoose', 'express', 'cors'];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');

    try {
        // Check if package.json exists
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('package.json not found');
        }

        // Read package.json and check dependencies
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const installedDependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        // Verify each required dependency
        for (const dep of requiredDependencies) {
            if (!installedDependencies[dep]) {
                throw new Error(`Required dependency not found: ${dep}`);
            }

            // Try to require the package to make sure it's properly installed
            try {
                require(dep);
            } catch (err) {
                throw new Error(`Failed to load dependency: ${dep}`);
            }
        }

        console.log('✅ All required dependencies verified');
    } catch (error: any) {
        console.error('❌ Dependency check failed:', error);
        throw new Error(`Dependency check failed: ${error.message}`);
    }
};

export default performHealthCheck;
