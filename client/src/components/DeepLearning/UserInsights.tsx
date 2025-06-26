import React, { useState, useEffect } from 'react';
import {
  LightBulbIcon,
  UserGroupIcon,
  ArrowPathIcon,
  HeartIcon,
  AcademicCapIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import deepLearningService from '../../services/deepLearningService';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const UserInsights: React.FC = () => {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [accordionStates, setAccordionStates] = useState({
    analysisResults: false,
    topicsOfInterest: false,
    usagePatterns: false
  });
  const { isAuthenticated } = useAuth();

  const fetchAnalysis = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to access this feature');
      return;
    }
    setLoadingAnalysis(true);
    setError(null);
    try {
      const result = await deepLearningService.analyzeUserBehavior();
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze user behavior');
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to access this feature');
      return;
    }
    setLoadingRecommendations(true);
    setError(null);
    try {
      const result = await deepLearningService.getRecommendations();
      setRecommendations(result);
    } catch (err) {
      setError('Failed to get recommendations');
      console.error(err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (analysis && analysis.success) {
      fetchRecommendations();
    }
  }, [analysis]);

  const parseAnalysisSections = (analysis: string) => {
    const regex = /(\d\))\s([^:]+):\s*\n([\s\S]*?)(?=(?:\n\d\))|$)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(analysis)) !== null) {
      matches.push({
        section: match[2].trim(),
        content: match[3].trim()
      });
    }
    return matches;
  };

  const toggleAccordion = (section: keyof typeof accordionStates) => {
    setAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-4 py-3 rounded mb-4 flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          Please log in to access personalized insights and recommendations.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">User Insights & Recommendations</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Our deep learning system analyzes your interactions to provide personalized insights and recommendations.
      </p>
      <hr className="my-4 border-gray-200 dark:border-gray-700" />

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4 flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Behavior Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <LightBulbIcon className="h-6 w-6 text-blue-500 dark:text-blue-300 mr-2" />
            <span className="font-semibold text-lg text-gray-900 dark:text-white">Behavior Analysis</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Discover patterns in how you use the platform and identify your areas of interest.
          </p>
          <button
            className={`inline-flex items-center px-4 py-2 rounded bg-blue-600 dark:bg-blue-700 text-white font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-800 transition ${
              loadingAnalysis ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={fetchAnalysis}
            disabled={loadingAnalysis}
            type="button"
          >
            {loadingAnalysis && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            {loadingAnalysis ? 'Analyzing...' : 'Analyze My Behavior'}
          </button>

          {analysis && analysis.success && (
            <div className="mt-4 space-y-4">
              {/* Analysis Results Accordion */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleAccordion('analysisResults')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <LightBulbIcon className="h-5 w-5 text-blue-400 dark:text-blue-200 mr-2" />
                    <span className="font-semibold text-gray-900 dark:text-white">Analysis Results</span>
                  </div>
                  {accordionStates.analysisResults ? 
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  }
                </button>
                {accordionStates.analysisResults && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                    {typeof analysis === 'string' || typeof analysis.analysis === 'string' ? (
                      <ReactMarkdown>
                        {typeof analysis === 'string' ? analysis : analysis.analysis}
                      </ReactMarkdown>
                    ) : (
                      parseAnalysisSections(
                        typeof analysis === 'string'
                          ? analysis
                          : typeof analysis.analysis === 'string'
                            ? analysis.analysis
                            : ''
                      ).map((section, idx) => {
                        let icon = <LightBulbIcon className="h-4 w-4 text-blue-400 dark:text-blue-200 mr-1" />;
                        if (/topics/i.test(section.section)) icon = <UserGroupIcon className="h-4 w-4 text-purple-400 dark:text-purple-200 mr-1" />;
                        else if (/interaction/i.test(section.section)) icon = <ArrowPathIcon className="h-4 w-4 text-cyan-400 dark:text-cyan-200 mr-1" />;
                        else if (/content/i.test(section.section)) icon = <HeartIcon className="h-4 w-4 text-pink-400 dark:text-pink-200 mr-1" />;
                        else if (/learning/i.test(section.section)) icon = <AcademicCapIcon className="h-4 w-4 text-green-400 dark:text-green-200 mr-1" />;
                        return (
                          <div key={idx} className="mb-3">
                            <div className="flex items-center font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                              {icon}
                              {section.section}
                            </div>
                            <div className="text-gray-700 dark:text-gray-200 whitespace-pre-line text-sm">{section.content}</div>
                          </div>
                        );
                      })
                    )}
                    {analysis.timestamp && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Analysis generated: {new Date(analysis.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Topics of Interest Accordion */}
              {analysis.topicsOfInterest && analysis.topicsOfInterest.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleAccordion('topicsOfInterest')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-purple-400 dark:text-purple-200 mr-2" />
                      <span className="font-semibold text-gray-900 dark:text-white">Topics of Interest</span>
                    </div>
                    {accordionStates.topicsOfInterest ? 
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    }
                  </button>
                  {accordionStates.topicsOfInterest && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {analysis.topicsOfInterest.map((topic: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium border border-blue-200 dark:border-blue-700"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Usage Patterns Accordion */}
              {analysis.usagePatterns && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleAccordion('usagePatterns')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <ArrowPathIcon className="h-5 w-5 text-cyan-400 dark:text-cyan-200 mr-2" />
                      <span className="font-semibold text-gray-900 dark:text-white">Feature Usage Patterns</span>
                    </div>
                    {accordionStates.usagePatterns ? 
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    }
                  </button>
                  {accordionStates.usagePatterns && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(analysis.usagePatterns).map(([feature, count]: any, idx) => (
                          <span
                            key={feature}
                            className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 text-xs font-medium border border-cyan-200 dark:border-cyan-700"
                            title={`Used ${count} times`}
                          >
                            {feature}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {analysis && !analysis.success && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-4 py-3 rounded mt-4 flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 mr-2" />
              {analysis.message}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <AcademicCapIcon className="h-6 w-6 text-green-500 dark:text-green-300 mr-2" />
            <span className="font-semibold text-lg text-gray-900 dark:text-white">Learning Recommendations</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Get personalized recommendations based on your interactions and interests.
          </p>
          <button
            className={`inline-flex items-center px-4 py-2 rounded bg-green-600 dark:bg-green-700 text-white font-semibold shadow hover:bg-green-700 dark:hover:bg-green-800 transition ${
              loadingRecommendations ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={fetchRecommendations}
            disabled={loadingRecommendations}
            type="button"
          >
            {loadingRecommendations && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            {loadingRecommendations ? 'Getting Recommendations...' : 'Refresh Recommendations'}
          </button>
          {recommendations && recommendations.success && (
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <AcademicCapIcon className="h-5 w-5 text-green-400 dark:text-green-200 mr-1" />
                <span className="font-semibold text-gray-900 dark:text-white">Your Recommendations</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 mb-2 text-gray-700 dark:text-gray-200 text-sm max-h-96 overflow-y-auto">
                <ReactMarkdown>
                  {recommendations.recommendations}
                </ReactMarkdown>
              </div>
              {recommendations.basedOn && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Based on: {recommendations.basedOn}
                </div>
              )}
            </div>
          )}
          {recommendations && !recommendations.success && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-4 py-3 rounded mt-4 flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 mr-2" />
              {recommendations.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInsights;
