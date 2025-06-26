import React from 'react';
import { Link } from 'react-router-dom';

interface LoginPromptProps {
    feature: 'chat' | 'document' | 'image' | 'textToSpeech' | 'speechToText';
}

const featureDescriptions = {
    chat: 'continue asking questions',
    document: 'upload more documents',
    image: 'generate more images',
    textToSpeech: 'convert more text to speech',
    speechToText: 'use speech to text conversion'
};

const LoginPrompt: React.FC<LoginPromptProps> = ({ feature }) => {
    return (
        <div className="login-prompt">
            <div className="login-prompt-content">
                <h3>Free usage limit reached</h3>
                <p>
                    You've reached the limit for free usage of our {feature} feature.
                    To {featureDescriptions[feature]}, please log in or create an account.
                </p>
                <div className="login-buttons">
                    <Link to="/login" className="login-button">
                        Log In
                    </Link>
                    <Link to="/signup" className="signup-button">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPrompt;
