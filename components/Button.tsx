import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  active?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'default', 
  className = '', 
  disabled = false,
  active = false
}) => {
  const baseStyles = "relative overflow-hidden font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center select-none";
  
  const variants = {
    default: "bg-gray-800 hover:bg-gray-700 text-white rounded-2xl shadow-sm border border-gray-700/50",
    primary: "bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-900/20",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white rounded-2xl",
    accent: "bg-orange-500 hover:bg-orange-400 text-white rounded-2xl shadow-lg shadow-orange-900/20",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-2xl",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl"
  };

  const activeStyle = active ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${activeStyle} ${className}`}
    >
      <span className="relative z-10 text-xl md:text-2xl">{label}</span>
    </button>
  );
};

export default Button;