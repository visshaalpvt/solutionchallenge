import React from 'react';

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          w-full px-4 py-3 rounded-xl
          bg-slate-50 border border-slate-100
          text-slate-900 text-sm font-bold placeholder-slate-400
          focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white
          transition-all duration-300
        "
        {...props}
      />
    </div>
  );
};

export const TextArea = ({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  rows = 4,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="
          w-full px-4 py-3 rounded-xl
          bg-slate-50 border border-slate-100
          text-slate-900 text-sm font-bold placeholder-slate-400
          focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white
          transition-all duration-300 resize-none
        "
        {...props}
      />
    </div>
  );
};

export default Input;
