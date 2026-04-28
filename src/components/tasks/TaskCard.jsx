import React from 'react';
import { MapPin, Clock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge, { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';

const TaskCard = ({ task, onAssign, onAccept, onComplete, volunteers = [], showActions = true }) => {
  const assignedVol = volunteers.find(v => v.uid === task.assignedTo);
  const timeAgo = task.createdAt?.toDate ? getTimeAgo(task.createdAt.toDate()) : 'Just now';

  return (
    <Card className="flex flex-col h-full border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {task.autoAssigned && (
            <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-600 text-[9px] font-black uppercase border border-purple-100 animate-pulse">
              🤖 Auto
            </span>
          )}
        </div>
        {task.urgencyScore && (
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
             <span className="text-sm font-black text-indigo-600">{task.urgencyScore}/10</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      {task.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {task.requiredSkills.map(skill => (
            <span key={skill} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100/50">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-slate-50">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-4">
          {task.zone && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-300" /> {task.zone}
            </span>
          )}
          {assignedVol && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
              <User className="w-3.5 h-3.5 text-slate-400" /> {assignedVol.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-300" /> {timeAgo}
          </span>
        </div>

        {showActions && (
          <div className="flex gap-3">
            {task.status === 'open' && onAssign && (
              <Button variant="secondary" size="md" onClick={() => onAssign(task)} className="flex-1 rounded-2xl py-3">
                Assign
              </Button>
            )}
            {task.status === 'open' && onAccept && (
              <Button variant="primary" size="md" icon={CheckCircle2} onClick={() => onAccept(task)} className="flex-1 rounded-2xl py-3 shadow-lg shadow-indigo-100">
                Accept
              </Button>
            )}
            {task.status === 'assigned' && onComplete && (
              <Button variant="success" size="md" icon={CheckCircle2} onClick={() => onComplete(task)} className="flex-1 rounded-2xl py-3 shadow-lg shadow-emerald-100">
                Complete
              </Button>
            )}
          </div>
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

export default TaskCard;
