import React from 'react';
import { Link } from 'react-router-dom';

interface LoginPromptProps {
    feature?: string;
    message?: string;
}

export const LoginPrompt: React.FC<LoginPromptProps> = ({
    feature,
    message = `You've reached the limit for this feature as a guest user.`
}) => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 my-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
                {feature ? `${feature.charAt(0).toUpperCase() + feature.slice(1)} Usage Limit Reached` : 'Usage Limit Reached'}
            </h3>
            <p className="text-gray-300 mb-4">{message}</p>
            <div className="flex space-x-4">
                <Link
                    to="/login"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                    Log In
                </Link>
                <Link
                    to="/register"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                    Sign Up
                </Link>
            </div>
        </div>
    );
};

export default LoginPrompt;
