import React, { useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import nlpService from '../../services/nlpService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TextAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [entitiesResult, setEntitiesResult] = useState<any>(null);
  const [keywordsResult, setKeywordsResult] = useState<any>(null);
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [maxSummaryLength, setMaxSummaryLength] = useState<number>(100);

  const tabList = [
    'Sentiment Analysis',
    'Entity Extraction',
    'Keyword Extraction',
    'Text Summarization'
  ];

  const handleTabChange = (idx: number) => {
    setTabValue(idx);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleSummaryLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxSummaryLength(Number(event.target.value));
  };

  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await nlpService.analyzeSentiment(text);
      setSentimentResult(result);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractEntities = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await nlpService.extractEntities(text);
      setEntitiesResult(result);
    } catch (error) {
      console.error('Error extracting entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractKeywords = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await nlpService.extractKeywords(text);
      setKeywordsResult(result);
    } catch (error) {
      console.error('Error extracting keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  const summarizeText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await nlpService.summarizeText(text, maxSummaryLength);
      setSummaryResult(result);
    } catch (error) {
      console.error('Error summarizing text:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCurrentTab = () => {
    switch (tabValue) {
      case 0:
        analyzeSentiment();
        break;
      case 1:
        extractEntities();
        break;
      case 2:
        extractKeywords();
        break;
      case 3:
        summarizeText();
        break;
      default:
        break;
    }
  };

  const parseSentiment = (sentimentStr: string) => {
    try {
      const cleaned = sentimentStr.replace(/[\n\r]/g, '').replace(/([a-zA-Z0-9_]+):/g, '"$1":');
      return JSON.parse(cleaned);
    } catch {
      return { sentiment: sentimentStr, confidence: null };
    }
  };

  const renderResults = () => {
    switch (tabValue) {
      case 0:
        if (!sentimentResult) return null;
        const sentimentData = parseSentiment(sentimentResult.sentiment);
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2 text-gray-900 dark:text-gray-100">
                {sentimentData.sentiment?.charAt(0).toUpperCase() + sentimentData.sentiment?.slice(1) || 'N/A'}
              </span>
              {sentimentData.confidence !== undefined && (
                <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
                  Confidence: {(sentimentData.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
            {sentimentData.confidence !== undefined && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 mb-2">
                <div
                  className="bg-blue-500 dark:bg-blue-600 h-2 rounded"
                  style={{ width: `${sentimentData.confidence * 100}%` }}
                />
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Input: <span className="text-gray-700 dark:text-gray-200">{sentimentResult.text}</span>
            </div>
          </div>
        );
      case 1:
        if (!entitiesResult) return null;
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Extracted Entities</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {entitiesResult.entities?.entities?.map((entity: any, idx: number) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded border text-xs font-medium ${
                    entity.type === 'person'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                      : entity.type === 'location'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {entity.entity} ({entity.type})
                </span>
              ))}
            </div>
            <div>
              {entitiesResult.entities?.entities?.map((entity: any, idx: number) => (
                <div key={idx} className="mb-1 text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">{entity.entity}</span> ({entity.type}) — Confidence: {(entity.confidence * 100).toFixed(0)}%
                  <div className="inline-block ml-2 w-32 align-middle">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-1.5">
                      <div
                        className="bg-blue-500 dark:bg-blue-600 h-1.5 rounded"
                        style={{ width: `${entity.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Input: <span className="text-gray-700 dark:text-gray-200">{entitiesResult.text}</span>
            </div>
          </div>
        );
      case 2:
        if (!keywordsResult) return null;
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Extracted Keywords</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywordsResult.keywords?.map((keyword: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Input: <span className="text-gray-700 dark:text-gray-200">{keywordsResult.text}</span>
            </div>
          </div>
        );
      case 3:
        if (!summaryResult) return null;
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Text Summary</div>
            <div className="mb-2 text-gray-900 dark:text-gray-100">{summaryResult.summary}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Input: <span className="text-gray-700 dark:text-gray-200">{summaryResult.text}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Text Analysis Tools</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Use our NLP-powered tools to analyze your text. Enter your text below and select an analysis type.
      </p>
      <hr className="my-4 border-gray-200 dark:border-gray-700" />
      <div>
        <textarea
          className="w-full border border-gray-300 dark:border-gray-700 rounded p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 bg-white text-gray-900"
          rows={6}
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your text here..."
        />
      </div>
      <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700">
        {tabList.map((tab, idx) => (
          <button
            key={tab}
            className={`py-2 px-4 -mb-px border-b-2 font-medium transition-colors ${
              tabValue === idx
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
            }`}
            onClick={() => handleTabChange(idx)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mb-4">
        {tabValue === 0 && (
          <div className="text-gray-700 dark:text-gray-300 mb-2">Detect the sentiment (positive, negative, neutral) of your text.</div>
        )}
        {tabValue === 1 && (
          <div className="text-gray-700 dark:text-gray-300 mb-2">Extract named entities (people, organizations, locations, etc.) from your text.</div>
        )}
        {tabValue === 2 && (
          <div className="text-gray-700 dark:text-gray-300 mb-2">Extract the most important keywords and phrases from your text.</div>
        )}
        {tabValue === 3 && (
          <div>
            <div className="text-gray-700 dark:text-gray-300 mb-2">Generate a concise summary of your text.</div>
            <input
              type="number"
              min={10}
              max={500}
              value={maxSummaryLength}
              onChange={handleSummaryLengthChange}
              className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Max length (words)"
            />
          </div>
        )}
      </div>
      <div className="mb-4">
        <button
          className={`inline-flex items-center px-6 py-2 rounded bg-blue-600 dark:bg-blue-700 text-white font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-800 transition ${
            loading || !text.trim() ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          onClick={analyzeCurrentTab}
          disabled={loading || !text.trim()}
          type="button"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {loading ? 'Processing...' : 'Analyze Text'}
        </button>
      </div>
      {renderResults()}
    </div>
  );
};

export default TextAnalyzer;
