import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
}) => {
  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl ${className}`}
    >
      {title && <h2 className="text-xl font-bold text-white mb-4">{title}</h2>}
      {children}
    </div>
  );
};
