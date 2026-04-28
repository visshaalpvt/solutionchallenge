import React from 'react';

const MatchScoreBar = ({ breakdown = {}, total = 0 }) => {
  const segments = [
    { key: 'skills', label: 'Skills', max: 40, color: 'bg-indigo-500' },
    { key: 'zone', label: 'Zone', max: 30, color: 'bg-purple-500' },
    { key: 'availability', label: 'Availability', max: 20, color: 'bg-emerald-500' },
    { key: 'workload', label: 'Capacity', max: 10, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Optimization</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-slate-900 leading-none">{total}</span>
          <span className="text-[10px] font-black text-slate-300 uppercase">/100</span>
        </div>
      </div>
      
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
        {segments.map((seg) => {
          const val = breakdown[seg.key] || 0;
          const pct = (val / 100) * 100;
          return (
            <div
              key={seg.key}
              style={{ width: `${pct}%` }}
              className={`${seg.color} h-full transition-all duration-1000 ease-out border-r border-white/10 last:border-0`}
              title={`${seg.label}: ${val}/${seg.max}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 truncate">{seg.label}</span>
            <div className="flex items-center gap-1">
               <div className={`w-1.5 h-1.5 rounded-full ${seg.color}`} />
               <span className="text-[10px] font-bold text-slate-600">{breakdown[seg.key] || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchScoreBar;
