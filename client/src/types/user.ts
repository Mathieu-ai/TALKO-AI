// Basic user interface
export interface User {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

// Extended user interface with plan information
export interface UserWithPlan extends User {
    plan: {
        name: string;
        features: string[];
        limits: Record<string, number>;
    };
}

export interface AuthUser {
    id: string;
    username: string;
    token: string;
    role: 'user' | 'admin';
}
