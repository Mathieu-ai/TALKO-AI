import React, { useState } from 'react';
import { AudioHistoryItem, TranscriptionExportFormat } from '../types/audio';

interface AudioHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    historyItems: AudioHistoryItem[];
    onSelectItem: (item: AudioHistoryItem) => void;
    onPlayAudio: (url: string, item: AudioHistoryItem) => void;
    onDownloadSelected: (items: AudioHistoryItem[]) => void;
    error: string | null;
    isLoading: boolean;
    onRetry: () => void;
}

const AudioHistorySidebar: React.FC<AudioHistorySidebarProps> = ({
    isOpen,
    onClose,
    historyItems,
    onSelectItem,
    onPlayAudio,
    onDownloadSelected,
    error,
    isLoading,
    onRetry
}) => {
    const [selectedItems, setSelectedItems] = useState<AudioHistoryItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'text-to-speech' | 'speech-to-text'>('all');

    // Toggle selection of an item
    const toggleItemSelection = (item: AudioHistoryItem) => {
        if (selectedItems.some(selected => selected.id === item.id)) {
            setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    // New function to toggle select all/unselect all
    const toggleSelectAll = () => {
        if (selectedItems.length === filteredItems.length) {
            // If all items are selected, unselect all
            setSelectedItems([]);
        } else {
            // Otherwise select all filtered items
            setSelectedItems([...filteredItems]);
        }
    };

    // Filter items based on type
    const filteredItems = filter === 'all' 
        ? historyItems 
        : historyItems.filter(item => item.type === filter);

    return (
        <div className={`fixed top-0 right-0 h-full w-80 bg-gray-800 text-gray-200 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-primary-300">Audio History</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                    aria-label="Close sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex border-b border-gray-700">
                <button 
                    className={`flex-1 py-2 text-sm font-medium ${filter === 'all' ? 'text-primary-300 border-b-2 border-primary-500' : 'text-gray-400'}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button 
                    className={`flex-1 py-2 text-sm font-medium ${filter === 'text-to-speech' ? 'text-primary-300 border-b-2 border-primary-500' : 'text-gray-400'}`}
                    onClick={() => setFilter('text-to-speech')}
                >
                    Text to Speech
                </button>
                <button 
                    className={`flex-1 py-2 text-sm font-medium ${filter === 'speech-to-text' ? 'text-primary-300 border-b-2 border-primary-500' : 'text-gray-400'}`}
                    onClick={() => setFilter('speech-to-text')}
                >
                    Speech to Text
                </button>
            </div>

            {/* Download selected button with simplified options */}
            {selectedItems.length > 0 && (
                <div className="p-3 bg-gray-700 border-b border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                        <button 
                            onClick={toggleSelectAll}
                            className="text-sm text-primary-400 hover:text-primary-300"
                        >
                            {selectedItems.length === filteredItems.length 
                                ? 'Unselect All' 
                                : 'Select All'}
                        </button>
                        <span className="text-sm">{selectedItems.length} selected</span>
                    </div>
                    
                    {/* Simple download button */}
                    <button
                        onClick={() => onDownloadSelected(selectedItems)}
                        className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-md flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Selected
                    </button>
                </div>
            )}

            {/* Error state with more details */}
            {error && (
                <div className="p-4 bg-red-900/30 border-b border-red-700 text-red-200">
                    <p className="text-sm mb-2 font-medium">Error loading history:</p>
                    <p className="text-sm mb-2 break-words">{error}</p>
                    <div className="flex space-x-2">
                        <button
                            onClick={onRetry}
                            className="text-xs bg-red-800 hover:bg-red-700 px-3 py-1 rounded"
                        >
                            Retry
                        </button>
                        
                        {/* Connection test button */}
                        <button
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/health`, '_blank')}
                            className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
                        >
                            Test Connection
                        </button>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="flex justify-center items-center p-8">
                    <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {/* History items */}
            <div className="overflow-y-auto h-[calc(100vh-140px)]">
                {!isLoading && filteredItems.length === 0 ? (
                    <div className="p-4 text-gray-400 text-center">
                        <p>No audio history found</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-700">
                        {filteredItems.map((item) => (
                            <li key={item.id} className="p-3 hover:bg-gray-700 transition-colors">
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.some(selected => selected.id === item.id)}
                                        onChange={() => toggleItemSelection(item)}
                                        className="mr-3 mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <button
                                                onClick={() => onSelectItem(item)}
                                                className="text-left text-sm font-medium text-gray-200 hover:text-primary-300"
                                            >
                                                {item.title || 'Untitled'}
                                            </button>
                                            <span className="text-xs text-gray-400 ml-2">
                                                {item.type === 'text-to-speech' ? 'TTS' : 'STT'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                                        
                                        {/* Controls based on item type */}
                                        <div className="mt-2 flex items-center justify-between">
                                            {/* Text-to-speech controls */}
                                            {item.type === 'text-to-speech' && item.audioUrl && (
                                                <button
                                                    onClick={() => onPlayAudio(item.audioUrl || '', item)}
                                                    className="text-primary-400 hover:text-primary-300 text-xs flex items-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Play
                                                </button>
                                            )}
                                            
                                            {/* Speech-to-text export options */}
                                            {item.type === 'speech-to-text' && item.text && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => onDownloadSelected([item])}
                                                        className="text-primary-400 hover:text-primary-300 text-xs flex items-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Speech-to-text text preview */}
                                        {item.type === 'speech-to-text' && item.text && (
                                            <div className="mt-2 text-xs text-gray-300 line-clamp-2 bg-gray-700/50 p-1 rounded">
                                                {item.text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AudioHistorySidebar;
