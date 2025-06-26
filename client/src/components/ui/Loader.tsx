import React from 'react';

type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bounce';
type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const sizeClass = sizeClasses[size];

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`${sizeClass} ${className}`}>
            <svg
              className="animate-spin text-primary-500 dark:text-primary-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        );
      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            <div className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse`}></div>
            <div className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse delay-150`}></div>
            <div className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse delay-300`}></div>
          </div>
        );
      case 'pulse':
        return (
          <div className={`${sizeClass} bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse ${className}`}></div>
        );
      case 'bounce':
        return (
          <div className={`flex space-x-1 ${className}`}>
            <div className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce`}></div>
            <div className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce delay-150`}></div>
            <div className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce delay-300`}></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {renderLoader()}
      {text && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{text}</p>}
    </div>
  );
};

export default Loader;
