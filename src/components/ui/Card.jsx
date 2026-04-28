import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6', 
  hover = true,
  onClick,
  id
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        bg-white border border-slate-200 rounded-[2rem] 
        ${padding} ${className}
        ${hover ? 'transition-all duration-300 hover:shadow-premium hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
