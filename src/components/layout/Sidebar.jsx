import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  ClipboardList,
  Users,
  Map,
  Briefcase,
  Search,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { signOutUser } from '../../services/authService';
import useUIStore from '../../stores/uiStore';

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/needs', icon: AlertTriangle, label: 'Needs' },
  { to: '/admin/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/admin/matching', icon: Users, label: 'Volunteers' },
  { to: '/admin/map', icon: Map, label: 'Map View' },
];

const volunteerLinks = [
  { to: '/volunteer/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/volunteer/browse', icon: Search, label: 'Browse Tasks' },
  { to: '/volunteer/tasks', icon: Briefcase, label: 'My Tasks' },
];

const Sidebar = () => {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : volunteerLinks;

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40
        bg-white border-r border-slate-200
        flex flex-col shadow-sm
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[80px]' : 'w-[260px]'}
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-slate-900 tracking-tight animate-fade-in">SmartAlloc</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 sidebar-scroll overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-4 px-3">
            {isAdmin ? 'Administration' : 'Volunteer'}
          </p>
        )}
        
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-200 group relative
              ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }
              ${collapsed ? 'justify-center' : ''}
              `
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!collapsed && (
                  <span className="whitespace-nowrap">{link.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-xl">
                    {link.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="!mt-8 pt-6 border-t border-slate-100 space-y-1.5">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-200
              ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
              ${collapsed ? 'justify-center' : ''}
              `
            }
          >
            <UserCircle className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Profile Settings</span>}
          </NavLink>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className={`flex items-center gap-3 px-2 py-3 rounded-2xl bg-white border border-slate-200 mb-3 shadow-sm ${collapsed ? 'justify-center' : ''}`}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-indigo-600">{user?.name?.[0] || 'U'}</span>
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
