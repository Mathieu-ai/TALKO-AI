import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { setAuth, getUser, logout as logoutUtil, User } from '../utils/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        // Check local storage for saved user data on initial load
        const savedUser = getUser();
        if (savedUser) {
            setCurrentUser(savedUser);
        }
    }, []);

    const login = (user: User, token: string) => {
        setAuth(token, user);
        setCurrentUser(user);
    };

    const logout = () => {
        setCurrentUser(null);
        logoutUtil();
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
