import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  required = false,
  className = '',
  id,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative group">
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="
            w-full px-4 py-2.5 rounded-xl appearance-none
            bg-slate-50 border border-slate-100
            text-slate-900 text-sm font-bold
            focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white
            transition-all duration-300
            cursor-pointer
          "
        >
          <option value="" className="bg-white text-slate-400">{placeholder}</option>
          {options.map((opt) => (
            <option
              key={typeof opt === 'string' ? opt : opt.value}
              value={typeof opt === 'string' ? opt : opt.value}
              className="bg-white text-slate-900"
            >
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
      </div>
    </div>
  );
};

export const MultiSelect = ({
  label,
  selected = [],
  onChange,
  options,
  className = '',
  id,
}) => {
  const toggleOption = (opt) => {
    const value = typeof opt === 'string' ? opt : opt.value;
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      )}
      <div id={id} className="flex flex-wrap gap-2.5">
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleOption(opt)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold
                transition-all duration-300
                ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95'
                }
              `}
            >
              {optLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Select;
