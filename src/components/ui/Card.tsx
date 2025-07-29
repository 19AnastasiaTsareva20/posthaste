import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  variant?: "default" | "elevated" | "bordered" | "gradient";
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  variant = "default",
  hover = false,
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variants = {
    default:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm",
    elevated: "bg-white dark:bg-gray-800 shadow-lg border-0",
    bordered:
      "bg-white dark:bg-gray-800 border-2 border-blue-500/20 dark:border-blue-400/20 shadow-sm",
    gradient:
      "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 shadow-md",
  };

  const hoverClasses = hover
    ? "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    : "transition-shadow duration-200";

  return (
    <div
      className={`${variants[variant]} ${paddingClasses[padding]} ${hoverClasses} rounded-xl ${className}`}
    >
      {children}
    </div>
  );
};
