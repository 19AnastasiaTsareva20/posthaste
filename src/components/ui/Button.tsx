import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "outline"
    | "ghost"
    | "gradient";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  loading = false,
  disabled,
  ...props
}) => {
  // Базовые классы
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  // Варианты стилей
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500/50 dark:bg-blue-500 dark:hover:bg-blue-600",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm focus:ring-gray-500/50 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    success:
      "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg focus:ring-green-500/50",
    danger:
      "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500/50",
    outline:
      "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white hover:shadow-md focus:ring-blue-500/50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400",
    ghost:
      "text-gray-700 hover:bg-gray-100 focus:ring-gray-500/30 dark:text-gray-300 dark:hover:bg-gray-700",
    gradient:
      "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500/50",
  };

  // Размеры
  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-base gap-2",
    lg: "px-6 py-3.5 text-lg gap-2.5",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
      )}
      {children}
    </button>
  );
};
