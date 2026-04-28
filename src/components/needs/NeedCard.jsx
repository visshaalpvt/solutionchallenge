import React from 'react';
import { MapPin, Clock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge, { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';

const NeedCard = ({ need, onConvertToTask, showActions = true }) => {
  const timeAgo = need.createdAt
    ? getTimeAgo(need.createdAt?.toDate ? need.createdAt.toDate() : new Date(need.createdAt))
    : 'Just now';

  return (
    <Card className="flex flex-col h-full border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <Badge urgency={need.urgencyLabel} />
          <StatusBadge status={need.status} />
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Score</span>
           <span className={`text-lg font-black ${
             need.urgencyScore >= 8 ? 'text-red-600' : 
             need.urgencyScore >= 5 ? 'text-orange-600' : 'text-indigo-600'
           }`}>
             {need.urgencyScore}/10
           </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
        {need.title}
      </h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed">
        {need.description}
      </p>

      {need.aiSummary && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1">
             <Sparkles className="w-3 h-3 text-indigo-300 opacity-50" />
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">AI Analysis</span>
            </div>
            {need.aiSource && (
              <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100/50">
                via {need.aiSource}
              </span>
            )}
          </div>
          <p className="text-xs text-indigo-800/80 font-medium leading-relaxed">{need.aiSummary}</p>
        </div>
      )}

      <div className="mt-auto space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          {need.zone && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-300" /> {need.zone}
            </span>
          )}
          {need.category && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/50">{need.category}</span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-300" /> {timeAgo}
          </span>
        </div>

        {showActions && need.status === 'open' && onConvertToTask && (
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => onConvertToTask(need)}
            className="w-full mt-2 rounded-2xl font-black py-3 shadow-lg shadow-indigo-100"
          >
            Create Action Task
          </Button>
        )}
      </div>
    </Card>
  );
};

function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default NeedCard;
