import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import NotificationPanel from '../ui/NotificationPanel';
import ToastNotification from '../ui/ToastNotification';
import useNeedsStore from '../../stores/needsStore';
import useTasksStore from '../../stores/tasksStore';
import useVolunteersStore from '../../stores/volunteersStore';
import useNotificationStore from '../../stores/notificationStore';
import useAuthStore from '../../stores/authStore';
import useUIStore from '../../stores/uiStore';

const DashboardLayout = () => {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const initNeeds = useNeedsStore((s) => s.initSubscription);
  const initTasks = useTasksStore((s) => s.initSubscription);
  const initVolunteers = useVolunteersStore((s) => s.initSubscription);
  const initNotifications = useNotificationStore((s) => s.initSubscription);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    let unsubNeeds, unsubTasks, unsubVolunteers, unsubNotifications;

    try {
      unsubNeeds = initNeeds();
      unsubTasks = initTasks();
      unsubVolunteers = initVolunteers();

      // Subscribe to notifications for this user
      if (user?.uid) {
        unsubNotifications = initNotifications(user.uid, user.role);
      }
    } catch (error) {
      console.warn('Subscription failed, using offline data:', error.message);
    }

    return () => {
      if (typeof unsubNeeds === 'function') unsubNeeds();
      if (typeof unsubTasks === 'function') unsubTasks();
      if (typeof unsubVolunteers === 'function') unsubVolunteers();
      if (typeof unsubNotifications === 'function') unsubNotifications();
    };
  }, [initNeeds, initTasks, initVolunteers, initNotifications, user?.uid, user?.role]);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar />
      
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${
          collapsed ? 'ml-[80px]' : 'ml-[260px]'
        }`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
          <div className="max-w-7xl mx-auto p-6 lg:p-10 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification Panel (slide-in from right) */}
      <NotificationPanel />
      
      {/* Toast Notifications (top-right floating) */}
      <ToastNotification />
    </div>
  );
};

export default DashboardLayout;
