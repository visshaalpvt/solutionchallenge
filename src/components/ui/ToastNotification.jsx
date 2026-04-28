import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Briefcase, AlertTriangle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../../stores/notificationStore';
import useAuthStore from '../../stores/authStore';

const iconMap = {
  new_task: Briefcase,
  task_assigned: CheckCircle2,
  task_completed: Sparkles,
  need_alert: AlertTriangle,
  system: Bell,
};

const colorMap = {
  new_task: 'from-indigo-600 to-blue-600',
  task_assigned: 'from-emerald-600 to-teal-600',
  task_completed: 'from-purple-600 to-pink-600',
  need_alert: 'from-red-600 to-orange-600',
  system: 'from-slate-600 to-slate-700',
};

const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setOnNewNotification = useNotificationStore((s) => s.setOnNewNotification);

  const addToast = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { ...notification, toastId: id }]);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.toastId !== id));
    }, 6000);
  }, []);

  useEffect(() => {
    setOnNewNotification(addToast);
    return () => setOnNewNotification(null);
  }, [addToast, setOnNewNotification]);

  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  };

  const handleClick = (toast) => {
    dismissToast(toast.toastId);
    if (toast.type === 'new_task') {
      navigate(user?.role === 'admin' ? '/admin/tasks' : '/volunteer/browse');
    } else if (toast.type === 'task_assigned') {
      navigate('/volunteer/tasks');
    } else if (toast.type === 'need_alert') {
      navigate(user?.role === 'admin' ? '/admin/needs' : '/volunteer/browse');
    }
  };

  return (
    <div className="fixed top-24 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Bell;
          const gradient = colorMap[toast.type] || colorMap.system;

          return (
            <motion.div
              key={toast.toastId}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="pointer-events-auto w-[380px] max-w-[calc(100vw-3rem)]"
            >
              <div
                className={`bg-gradient-to-r ${gradient} rounded-2xl p-4 shadow-2xl cursor-pointer group relative overflow-hidden`}
                onClick={() => handleClick(toast)}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">{toast.title}</p>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed line-clamp-2">{toast.message}</p>
                    <p className="text-[10px] font-bold text-white/60 mt-2 flex items-center gap-1 uppercase tracking-wider">
                      Tap to view <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismissToast(toast.toastId); }}
                    className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotification;
