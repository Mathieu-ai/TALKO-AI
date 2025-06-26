import React from 'react';

const Documentation: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Talko AI Documentation</h1>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
                    <p className="mb-2">
                        Talko AI is a comprehensive AI-powered communication platform that offers various features
                        to enhance your productivity and creative workflow.
                    </p>
                    <p>
                        With Talko AI, you can chat with an AI assistant, generate images from text descriptions,
                        convert text to speech, transcribe audio to text, and more.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Features</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-md">
                            <h3 className="text-xl font-medium mb-2">Chat</h3>
                            <p>
                                Have natural conversations with our AI assistant. Ask questions, get information,
                                brainstorm ideas, and more.
                            </p>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-md">
                            <h3 className="text-xl font-medium mb-2">Image Generation</h3>
                            <p>
                                Turn your ideas into images. Describe what you want to see, and our AI will generate
                                corresponding visuals.
                            </p>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-md">
                            <h3 className="text-xl font-medium mb-2">Text to Speech</h3>
                            <p>
                                Convert written text into natural-sounding speech with various voice options.
                            </p>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-md">
                            <h3 className="text-xl font-medium mb-2">Speech to Text</h3>
                            <p>
                                Transcribe spoken audio into written text with high accuracy.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3">Getting Started</h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Create an account or use as a guest (with limited access)</li>
                        <li>Navigate to the feature you want to use</li>
                        <li>Follow the on-screen instructions for each feature</li>
                        <li>For best results, be clear and specific in your prompts</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default Documentation;
