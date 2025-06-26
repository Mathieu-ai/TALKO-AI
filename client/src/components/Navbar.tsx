import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-6 md:px-8 shadow-sm"
        >
            <div className="container mx-auto flex justify-between items-center">
                <div className="hidden md:block text-2xl font-bold bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
                    TALKO-AI
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                    <ThemeToggle />
                    
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 dark:text-gray-300 hidden md:inline-block font-medium">
                                Welcome, {user?.username}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleLogout}
                                className="border border-gray-300 dark:border-gray-600"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                to="/login"
                            >
                                Login
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                to="/register"
                            >
                                Register
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
