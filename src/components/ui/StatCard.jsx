import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'accent-primary',
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const target = typeof value === 'number' ? value : 0;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * target);
      setDisplayValue(current);

      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      countRef.current = requestAnimationFrame(animate);
    }, delay + 400);

    return () => {
      clearTimeout(timer);
      if (countRef.current) cancelAnimationFrame(countRef.current);
    };
  }, [value, delay]);

  const colorMap = {
    'accent-primary': {
      icon: 'text-indigo-600',
      bg: 'bg-indigo-50',
      glow: 'shadow-indigo-500/10',
    },
    'urgency-critical': {
      icon: 'text-red-600',
      bg: 'bg-red-50',
      glow: 'shadow-red-500/10',
    },
    'success': {
      icon: 'text-emerald-600',
      bg: 'bg-emerald-50',
      glow: 'shadow-emerald-500/10',
    },
    'warning': {
      icon: 'text-amber-600',
      bg: 'bg-amber-50',
      glow: 'shadow-amber-500/10',
    },
    'info': {
      icon: 'text-blue-600',
      bg: 'bg-blue-50',
      glow: 'shadow-blue-500/10',
    },
  };

  const c = colorMap[color] || colorMap['accent-primary'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="bg-white border border-slate-200 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">{title}</p>
          <div className="flex items-baseline gap-1">
             <p className="text-4xl font-black text-slate-900 tracking-tight">
               {displayValue}
             </p>
             {trendLabel && (
               <span
                 className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                   trend === 'up' ? 'text-emerald-600 bg-emerald-50' : trend === 'down' ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-50'
                 }`}
               >
                 {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
               </span>
             )}
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${c.bg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
          {Icon && <Icon className={`w-7 h-7 ${c.icon}`} />}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
