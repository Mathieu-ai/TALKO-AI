// Define user interface
export interface User {
    id: string;
    username: string;
    email: string;
    // Add any other user properties here
}

const TOKEN_KEY = 'talko_token';
const USER_KEY = 'talko_user';

// Set authentication data in local storage
export const setAuth = (token: string, user: User): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get the current auth token
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Get the current user
export const getUser = (): User | null => {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;

    try {
        return JSON.parse(userJson) as User;
    } catch (error) {
        console.error('Failed to parse user data', error);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// Log out - clear auth data
export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// Feature access limits for anonymous users
export const ANONYMOUS_LIMITS = {
    conversations: 1,
    images: 1,
    textToSpeech: 1,
    speechToText: 0, // Not available for anonymous users
    documentProcessing: 0,
    conversation: 1,
    chat: 1
};

// Check if a feature is available for the current user
export const canAccessFeature = (feature: string): boolean => {
    // Logged in users can access all features
    if (isAuthenticated()) return true;

    // Anonymous users have limited access
    return (ANONYMOUS_LIMITS as any)[feature] > 0;
};

// Get a descriptive message for feature access limitation
export const getFeatureAccessMessage = (feature: string): string => {
    if (isAuthenticated()) return "";

    if ((ANONYMOUS_LIMITS as any)[feature] === 0) {
        return `You need to log in to use the ${feature} feature.`;
    }

    return `Anonymous users can use the ${feature} feature ${(ANONYMOUS_LIMITS as any)[feature]} time(s). Log in for unlimited access.`;
};

// Check if download functionality is available
export const canDownload = (): boolean => {
    return isAuthenticated();
};

// Get a message about history accessibility
export const getHistoryAccessMessage = (): string => {
    return isAuthenticated()
        ? "You can access your full history"
        : "Log in to save and access your history";
};
