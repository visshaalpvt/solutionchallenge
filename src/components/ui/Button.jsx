import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  isLoading = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
    ghost: 'bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-indigo-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-[10px] rounded-lg gap-1',
    sm: 'px-4 py-2 text-xs rounded-xl gap-2',
    md: 'px-5 py-2.5 text-sm rounded-2xl gap-2.5',
    lg: 'px-8 py-4 text-base rounded-[1.25rem] gap-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
