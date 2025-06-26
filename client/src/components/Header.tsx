import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">TALKO-AI</Link>
            </div>

            <nav className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/documentation">Documentation</Link>
                <Link to="/chat">Chat</Link>
                <Link to="/image-generator">Image Generator</Link>
            </nav>

            <div className="auth-section">
                {isAuthenticated ? (
                    <div className="user-info">
                        <span>Welcome, {user?.username}</span>
                        <button onClick={logout} className="logout-btn">Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="login-btn">Login</Link>
                )}
            </div>
        </header>
    );
};

export default Header;
