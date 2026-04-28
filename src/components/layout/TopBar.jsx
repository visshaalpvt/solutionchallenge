import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Settings } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

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
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header
      id="top-bar"
      className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <span className="text-indigo-600">{user?.role}</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
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
        
        <button className="relative p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <button className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
