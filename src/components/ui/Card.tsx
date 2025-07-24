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
  // Размеры отступов / Padding sizes
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  // Варианты стилей / Style variants
  const variants = {
    default:
      "bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-soft",
    elevated: "bg-surface dark:bg-dark-surface shadow-large border-0",
    bordered:
      "bg-surface dark:bg-dark-surface border-2 border-primary/20 dark:border-night-primary/20 shadow-soft",
    gradient:
      "bg-gradient-card dark:bg-gradient-card-dark border border-border/50 dark:border-dark-border/50 shadow-medium",
  };

  // Эффект наведения / Hover effect
  const hoverClasses = hover
    ? "transition-all duration-300 hover:shadow-large hover:-translate-y-1 hover:border-primary/30 dark:hover:border-night-primary/30 cursor-pointer"
    : "transition-shadow duration-200";

  return (
    <div
      className={`
      ${variants[variant]} 
      ${paddingClasses[padding]} 
      ${hoverClasses}
      rounded-xl 
      backdrop-blur-sm 
      animate-fade-in 
      ${className}
    `}
    >
      {children}
    </div>
  );
};
