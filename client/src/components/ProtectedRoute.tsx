import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginPrompt } from './LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { checkUsageLimit } from '../utils/usageRestrictions';
import { FeatureName } from '../types/chat';

interface ProtectedRouteProps {
    children: React.ReactNode;
    feature?: string;
    requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    feature,
    requireAuth = false
}) => {
    const { isAuthenticated } = useAuth();

    // If authentication is required and user is not logged in
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If there's a feature specified, check if the user can access it
    if (feature && !isAuthenticated) {
        const canAccess = checkUsageLimit(feature as FeatureName, isAuthenticated);
        if (!canAccess) {
            return <LoginPrompt feature={feature} />;
        }
    }

    // If all checks pass, render the children
    return <>{children}</>;
};
