import React from 'react';
import { Inbox, Sparkles } from 'lucide-react';
import Button from './Button';
import { motion } from 'framer-motion';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data yet',
  description = 'Items will appear here once created.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-20 px-8 rounded-[2.5rem] bg-white border-2 border-dashed border-slate-100 ${className}`}
    >
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-6 relative">
        <Icon className="w-10 h-10 text-indigo-600" />
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-indigo-300 opacity-50" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm font-medium text-slate-500 text-center max-w-sm mb-8 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          variant="primary" 
          size="lg" 
          className="rounded-2xl px-8 shadow-xl shadow-indigo-100 font-black"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
