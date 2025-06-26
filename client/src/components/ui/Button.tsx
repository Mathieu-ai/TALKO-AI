import React from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  to?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  to,
  leftIcon,
  rightIcon,
  fullWidth,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm dark:bg-primary-700 dark:hover:bg-primary-600',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500 shadow-sm dark:bg-secondary-700 dark:hover:bg-secondary-600',
    tertiary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-sm dark:bg-indigo-700 dark:hover:bg-indigo-600',
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-gray-400',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm dark:bg-red-700 dark:hover:bg-red-600',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-lg',
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  const content = (
    <>
      {isLoading && (
        <span className="mr-2">
          <Loader variant="spinner" size="sm" />
        </span>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={isLoading || props.disabled} {...props}>
      {content}
    </button>
  );
};

export default Button;
