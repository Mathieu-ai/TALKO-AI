import React from 'react';
import Sidebar from '../Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;
