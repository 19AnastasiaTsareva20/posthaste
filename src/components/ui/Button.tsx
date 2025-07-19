import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  loading = false,
  disabled,
  ...props
}) => {
  // Базовые классы / Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  // Варианты стилей / Style variants
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark hover:shadow-primary focus:ring-primary/50 dark:bg-night-primary dark:hover:bg-night-accent',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-medium focus:ring-neutral-500/50 dark:bg-dark-surface dark:text-dark-text-primary dark:hover:bg-dark-border',
    success: 'bg-success text-white hover:bg-green-600 hover:shadow-lg focus:ring-success/50',
    danger: 'bg-danger text-white hover:bg-red-600 hover:shadow-lg focus:ring-danger/50',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white hover:shadow-primary focus:ring-primary/50 dark:border-night-primary dark:text-night-primary dark:hover:bg-night-primary',
    ghost: 'text-text-primary hover:bg-neutral-100 hover:text-primary focus:ring-primary/30 dark:text-dark-text-primary dark:hover:bg-dark-surface',
    gradient: 'bg-gradient-primary text-white hover:shadow-large hover:scale-105 focus:ring-primary/50'
  };
  
  // Размеры / Sizes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3.5 text-lg gap-2.5',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
