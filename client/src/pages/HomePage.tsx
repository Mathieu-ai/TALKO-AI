import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
    const features = [
        {
            title: 'Chat with AI',
            description: 'Have natural conversations with our advanced AI assistant.',
            link: '/chat',
            icon: '💬',
        },
        {
            title: 'Document Processing',
            description: 'Upload and analyze documents, extract insights automatically.',
            link: '/document',
            icon: '📄',
        },
        {
            title: 'Image Generation',
            description: 'Create stunning images from text descriptions.',
            link: '/image',
            icon: '🖼️',
        },
        {
            title: 'Audio Processing',
            description: 'Transcribe audio, generate speech, and analyze voice content.',
            link: '/audio',
            icon: '🔊',
        },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16 px-4 sm:px-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="py-12 text-center"
                >
                    <div className="space-y-8">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="inline-block p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl backdrop-blur-sm"
                        >
                            <h2 className="text-primary-700 dark:text-primary-300 font-medium tracking-wide text-sm uppercase">Welcome to</h2>
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent"
                        >
                            TALKO-AI Platform
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300"
                        >
                            Advanced AI capabilities accessible through simple interfaces.
                            Chatbots, document analysis, image generation, and speech processing in one place.
                        </motion.p>
                    </div>
                </motion.div>

                {/* Features Section */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="py-16"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={item}
                                whileHover={{ scale: 1.03, y: -5 }}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-primary-500/10"
                            >
                                <div className="p-6">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 h-20">{feature.description}</p>
                                    <Button
                                        to={feature.link}
                                        variant="primary"
                                        rightIcon={
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        }
                                    >
                                        Try it now
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HomePage;
