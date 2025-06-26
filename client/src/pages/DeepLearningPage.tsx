import React from 'react';
import UserInsights from '../components/DeepLearning/UserInsights';

const DeepLearningPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 px-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deep Learning Insights</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Discover personalized insights and recommendations based on your activity patterns.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-start py-10 px-2 sm:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-3xl">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
            <UserInsights />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepLearningPage;
