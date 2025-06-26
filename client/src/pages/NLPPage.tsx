import React from 'react';
import TextAnalyzer from '../components/NLP/TextAnalyzer';

const NLPPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 px-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Natural Language Processing</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Powerful NLP tools powered by AI to analyze and understand text content.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-start py-10 px-2 sm:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-3xl">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
            <TextAnalyzer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NLPPage;
