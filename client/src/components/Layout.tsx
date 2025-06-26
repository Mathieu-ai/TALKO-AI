import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PageTransition from './ui/PageTransition';

const Layout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="h-full">
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
