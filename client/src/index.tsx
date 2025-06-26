import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import DocumentPage from './pages/DocumentPage';
import ImagePage from './pages/ImagePage';
import AudioPage from './pages/AudioPage';
import NLPPage from './pages/NLPPage';
import DeepLearningPage from './pages/DeepLearningPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <HomePage />,
                },
                {
                    path: "chat",
                    element: <ChatPage />,
                },
                {
                    path: "document",
                    element: <DocumentPage />,
                },
                {
                    path: "image",
                    element: <ImagePage />,
                },
                {
                    path: "audio",
                    element: <AudioPage />,
                },
                {
                    path: "nlp",
                    element: <NLPPage />,
                },
                {
                    path: "deep-learning",
                    element: <DeepLearningPage />,
                },
            ],
        },
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/register",
            element: <Register />,
        },
    ],
    {
        future: {
            v7_relativeSplatPath: true,
        },
    }
);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <AuthProvider>
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>
        </AuthProvider>
    </React.StrictMode>
);

reportWebVitals();