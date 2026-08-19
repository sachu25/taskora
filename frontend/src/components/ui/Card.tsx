import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 backdrop-blur-sm ${
        onClick ? 'cursor-pointer hover:border-slate-600 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
