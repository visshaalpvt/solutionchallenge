import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Settings, ShieldCheck, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import useTasksStore from '../../stores/tasksStore';
import { Trophy } from 'lucide-react';
import useUIStore from '../../stores/uiStore';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/needs': 'Needs Management',
  '/admin/tasks': 'Task Management',
  '/admin/matching': 'Volunteer Matching',
  '/admin/map': 'Map View',
  '/volunteer': 'Dashboard',
  '/volunteer/dashboard': 'Dashboard',
  '/volunteer/browse': 'Browse Tasks',
  '/volunteer/tasks': 'My Tasks',
  '/profile': 'Profile Settings',
};

const TopBar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const tasks = useTasksStore(s => s.tasks);
  const { togglePanel, getUnreadCount } = useNotificationStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const unreadCount = getUnreadCount();

  const completedCount = tasks.filter(t => t.assignedTo === user?.uid && t.status === 'completed').length;
  const getRank = (count) => {
    if (count >= 10) return { label: 'Legend', color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' };
    if (count >= 5) return { label: 'Elite', color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' };
    if (count >= 1) return { label: 'Bronze', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' };
    return { label: 'Rookie', color: 'bg-slate-50 text-slate-400', border: 'border-slate-100' };
  };
  const rank = getRank(completedCount);

  return (
    <header
      id="top-bar"
      className="h-20 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <span className="text-indigo-600">{user?.role}</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
        {user?.role === 'volunteer' && (
          <div className={`px-3 py-1 rounded-full border ${rank.border} ${rank.color} flex items-center gap-1.5 shadow-sm`}>
            <Trophy className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">{rank.label}</span>
          </div>
        )}
        <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
           <ShieldCheck className="w-3 h-3 text-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Secured</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center relative mr-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none text-slate-700"
          />
        </div>
        
        {/* Notification Bell */}
        <button 
          onClick={togglePanel}
          className="relative p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group"
        >
          <Bell className="w-5 h-5 group-hover:animate-[wiggle_0.3s_ease-in-out]" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-lg shadow-red-200"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
