import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">Talko AI</Link>

                <nav>
                    <ul className="flex space-x-6">
                        <li><Link to="/" className="hover:text-blue-200">Home</Link></li>
                        <li><Link to="/chat" className="hover:text-blue-200">Chat</Link></li>
                        <li><Link to="/image-generator" className="hover:text-blue-200">Images</Link></li>
                        <li><Link to="/documentation" className="hover:text-blue-200">Docs</Link></li>
                    </ul>
                </nav>

                <div>
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span>Welcome, {user?.username || 'User'}</span>
                            <button
                                onClick={logout}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-2">
                            <Link
                                to="/login"
                                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
