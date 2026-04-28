import React from 'react';

const Badge = ({ children, variant = 'info', urgency, className = '' }) => {
  const urgencyStyles = {
    critical: 'bg-red-50 text-red-700 border-red-100',
    high: 'bg-orange-50 text-orange-700 border-orange-100',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    low: 'bg-green-50 text-green-700 border-green-100',
  };

  const variantStyles = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  const styles = urgency ? urgencyStyles[urgency.toLowerCase()] : variantStyles[variant];

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border
        ${styles} ${className}
      `}
    >
      {urgency || children}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    open: { label: 'Open', variant: 'info' },
    assigned: { label: 'Assigned', variant: 'primary' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'slate' },
    'in_progress': { label: 'In Progress', variant: 'warning' },
    'in-progress': { label: 'In Progress', variant: 'warning' },
    resolved: { label: 'Resolved', variant: 'success' },
  };

  const safeStatus = (status || 'open').toLowerCase();
  const config = statusConfig[safeStatus] || statusConfig.open;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export default Badge;
