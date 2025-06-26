import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HomeIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    PhotoIcon,
    SpeakerWaveIcon,
    Bars3Icon,
    XMarkIcon,
    AcademicCapIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

type MenuItem = {
    path: string;
    name: string;
    icon: React.ReactNode;
};

const menuItems: MenuItem[] = [
    { path: '/', name: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/chat', name: 'Chat', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { path: '/document', name: 'Document', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { path: '/image', name: 'Image', icon: <PhotoIcon className="w-5 h-5" /> },
    { path: '/audio', name: 'Audio', icon: <SpeakerWaveIcon className="w-5 h-5" /> },
    { path: '/nlp', name: 'NLP', icon: <AcademicCapIcon className="w-5 h-5" /> },
    { path: '/deep-learning', name: 'Deep Learning', icon: <BeakerIcon className="w-5 h-5" /> },
];

const Sidebar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const renderMenuItem = (item: MenuItem) => {
        const isProtected = item.path === '/nlp' || item.path === '/deep-learning';
        if (isProtected && !isAuthenticated) {
            return (
                <div
                    key={item.path}
                    title="Please log in to access this feature"
                    className="flex items-center p-3 rounded-lg cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 transition-all duration-200"
                >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                </div>
            );
        }
        return (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-gray-700 dark:text-primary-400 font-medium'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <span className="mr-3">{item.icon}</span>
                {item.name}
            </NavLink>
        );
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="md:hidden fixed top-4 left-4 z-30 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
            >
                {isMobileMenuOpen ? (
                    <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-white" />
                ) : (
                    <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-white" />
                )}
            </button>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden fixed inset-y-0 left-0 z-20 w-64 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto"
                    >
                        <div className="p-5">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">TALKO-AI</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Your AI Assistant</p>
                            </div>

                            <nav>
                                <ul className="space-y-2">
                                    {menuItems.map(renderMenuItem)}
                                </ul>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="hidden md:block bg-white dark:bg-gray-800 w-64 p-5 h-full overflow-y-auto flex-shrink-0 border-r border-gray-200 dark:border-gray-700 shadow-sm"
            >
                <div className="mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">TALKO-AI</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Your AI Assistant</p>
                </div>

                <nav>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isProtected = item.path === '/nlp' || item.path === '/deep-learning';
                            if (isProtected && !isAuthenticated) {
                                return (
                                    <li key={item.path}>
                                        <div
                                            title="Please log in to access this feature"
                                            className="flex items-center px-4 py-3 rounded-lg cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 transition-all duration-200"
                                        >
                                            <span className="mr-3">{item.icon}</span>
                                            {item.name}
                                        </div>
                                    </li>
                                );
                            }
                            return (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-primary-50 text-primary-700 dark:bg-gray-700 dark:text-primary-400 font-medium'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`
                                        }
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        {item.name}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </motion.div>

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
