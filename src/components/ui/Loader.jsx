import React from 'react';

const Loader = ({ size = 'md', text = '', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 animate-spin" />
      </div>
      {text && <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader size="lg" text="Loading SmartAlloc..." />
  </div>
);

export default Loader;
