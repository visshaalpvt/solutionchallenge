import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Megaphone,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import useNotificationStore from '../../stores/notificationStore';
import useAuthStore from '../../stores/authStore';
import Button from './Button';

const typeConfig = {
  new_task: {
    icon: Briefcase,
    color: 'bg-indigo-100 text-indigo-600',
    accent: 'border-l-indigo-500',
  },
  task_assigned: {
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-600',
    accent: 'border-l-emerald-500',
  },
  task_completed: {
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-600',
    accent: 'border-l-purple-500',
  },
  need_alert: {
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600',
    accent: 'border-l-red-500',
  },
  system: {
    icon: Megaphone,
    color: 'bg-blue-100 text-blue-600',
    accent: 'border-l-blue-500',
  },
};

const getTimeAgo = (timestamp) => {
  if (!timestamp?.toDate) return 'Just now';
  const now = new Date();
  const date = timestamp.toDate();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const NotificationItem = ({ notification, onRead, onNavigate }) => {
  const config = typeConfig[notification.type] || typeConfig.system;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        p-4 border-l-4 ${config.accent} 
        ${notification.read ? 'bg-white opacity-60' : 'bg-white'}
        hover:bg-slate-50 transition-all cursor-pointer group
        border-b border-slate-50 last:border-b-0
      `}
      onClick={() => {
        onRead(notification.id);
        onNavigate(notification);
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-bold leading-tight ${notification.read ? 'text-slate-500' : 'text-slate-900'}`}>
              {notification.title}
            </p>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeAgo(notification.createdAt)}
            </span>
            {(notification.relatedTaskId || notification.relatedNeedId) && (
              <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                View Details <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationPanel = () => {
  const { notifications, showPanel, closePanel, markRead, markAllRead, getUnreadCount } = useNotificationStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const unreadCount = getUnreadCount();

  const handleNavigate = (notification) => {
    closePanel();
    if (notification.type === 'new_task') {
      navigate(user?.role === 'admin' ? '/admin/tasks' : '/volunteer/browse');
    } else if (notification.type === 'task_assigned') {
      navigate('/volunteer/tasks');
    } else if (notification.type === 'task_completed') {
      navigate('/admin/tasks');
    } else if (notification.type === 'need_alert') {
      navigate(user?.role === 'admin' ? '/admin/needs' : '/volunteer/browse');
    }
  };

  const handleMarkAllRead = () => {
    if (user?.uid) {
      markAllRead(user.uid);
    }
  };

  return (
    <AnimatePresence>
      {showPanel && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="fixed inset-0 z-[90] bg-slate-900/20 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
            className="fixed top-4 right-4 bottom-4 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 border border-slate-100 z-[100] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Notifications</h3>
                    <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={closePanel}
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 mb-1">No notifications yet</p>
                  <p className="text-xs text-slate-400 max-w-[240px]">
                    You'll be notified when new tasks are available or when you're assigned to one.
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.slice(0, 50).map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onRead={markRead}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closePanel();
                    navigate(user?.role === 'admin' ? '/admin/tasks' : '/volunteer/browse');
                  }}
                  className="w-full text-indigo-600 font-bold"
                >
                  {user?.role === 'admin' ? 'View All Tasks' : 'Browse Available Tasks'}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
