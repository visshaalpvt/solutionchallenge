import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, CheckCircle2, Clock, MapPin, Search, ArrowRight, Star, Heart, Bell, AlertTriangle, Sparkles } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import useAuthStore from '../../stores/authStore';
import useTasksStore from '../../stores/tasksStore';
import useNeedsStore from '../../stores/needsStore';
import useNotificationStore from '../../stores/notificationStore';
import { useNavigate } from 'react-router-dom';

const VolunteerDashboard = () => {
  const user = useAuthStore(s => s.user);
  const tasks = useTasksStore(s => s.tasks);
  const needs = useNeedsStore(s => s.needs);
  const notifications = useNotificationStore(s => s.notifications);
  const markRead = useNotificationStore(s => s.markRead);
  const navigate = useNavigate();

  const myTasks = tasks.filter(t => t.assignedTo === user?.uid);
  const activeTasks = myTasks.filter(t => t.status === 'assigned');
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const openTasks = tasks.filter(t => t.status === 'open');
  const nearbyNeeds = needs.filter(n => n.status === 'open').slice(0, 5);
  const unreadNotifs = notifications.filter(n => !n.read).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'new_task': return Briefcase;
      case 'task_assigned': return CheckCircle2;
      case 'need_alert': return AlertTriangle;
      default: return Bell;
    }
  };

  const getNotifColor = (type) => {
    switch (type) {
      case 'new_task': return 'bg-indigo-100 text-indigo-600';
      case 'task_assigned': return 'bg-emerald-100 text-emerald-600';
      case 'need_alert': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp?.toDate) return 'Just now';
    const diff = Date.now() - timestamp.toDate().getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8" 
      id="volunteer-dashboard"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{user?.name?.split(' ')[0] || 'Volunteer'}</span>!
          </h2>
          <p className="text-slate-500 font-medium mt-1">Ready to make an impact today? You have {activeTasks.length} tasks in progress.</p>
        </div>
        <Button 
          variant="primary" 
          size="md" 
          icon={Search} 
          onClick={() => navigate('/volunteer/browse')}
          className="rounded-full px-8 shadow-lg shadow-indigo-100"
        >
          Browse Tasks
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard title="Active Tasks" value={activeTasks.length} icon={Briefcase} color="accent-primary" delay={0} />
        <StatCard title="Impact Score" value={completedTasks.length * 10} icon={Star} color="success" delay={100} />
        <StatCard title="Open Tasks" value={openTasks.length} icon={Clock} color="warning" delay={150} />
        <StatCard title="Alerts" value={unreadNotifs.length} icon={Bell} color="urgency-critical" delay={200} />
      </div>

      {/* 🔔 ALERTS & NOTIFICATIONS SECTION */}
      <AnimatePresence>
        {unreadNotifs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card hover={false} padding="p-0" className="border-2 border-indigo-200 shadow-lg shadow-indigo-100/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm animate-pulse">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">New Alerts</h3>
                    <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">{unreadNotifs.length} unread notifications</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                  onClick={() => {
                    unreadNotifs.forEach(n => markRead(n.id));
                  }}
                >
                  Clear All
                </Button>
              </div>
              <div className="divide-y divide-slate-50">
                {unreadNotifs.map((notif) => {
                  const Icon = getNotifIcon(notif.type);
                  const colorClass = getNotifColor(notif.type);
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-6 py-4 hover:bg-indigo-50/30 transition-all cursor-pointer group flex items-start gap-4"
                      onClick={() => {
                        markRead(notif.id);
                        if (notif.type === 'new_task') navigate('/volunteer/browse');
                        else if (notif.type === 'task_assigned') navigate('/volunteer/tasks');
                      }}
                    >
                      <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {getTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Tasks */}
        <Card hover={false} padding="p-0" className="border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">My Active Pipeline</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">In Progress</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black">{activeTasks.length}</span>
          </div>
          <div className="divide-y divide-slate-100 min-h-[250px]">
            {activeTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-500">No active tasks assigned.</p>
                <button onClick={() => navigate('/volunteer/browse')} className="text-xs font-bold text-indigo-600 mt-2 hover:underline">Explore tasks →</button>
              </div>
            ) : (
              activeTasks.map(task => (
                <div key={task.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate('/volunteer/tasks')}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                          <MapPin className="w-3 h-3 text-slate-300" />
                          {task.zone}
                        </span>
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                    <div className="p-2 rounded-lg text-slate-300 group-hover:text-indigo-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Nearby Needs + Open Tasks */}
        <Card hover={false} padding="p-0" className="border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Available Tasks</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{openTasks.length} open • {nearbyNeeds.length} nearby needs</p>
            </div>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="divide-y divide-slate-100 min-h-[250px]">
            {openTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-500">No open tasks right now.</p>
                <p className="text-[10px] text-slate-400 mt-1">New tasks will appear here as they're created.</p>
              </div>
            ) : (
              openTasks.slice(0, 5).map(task => (
                <div key={task.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate('/volunteer/browse')}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] font-bold text-slate-400">{task.zone}</span>
                        {task.requiredSkills?.slice(0, 2).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase">{s}</span>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="xs"
                      className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); navigate('/volunteer/browse'); }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Rewards Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
               <h4 className="text-2xl font-black mb-2">You're making a difference!</h4>
               <p className="text-indigo-100 font-medium opacity-90 max-w-lg leading-relaxed">
                 You've completed <span className="font-black text-white">{completedTasks.length} tasks</span> so far. Keep it up to unlock new volunteer badges and community rewards.
               </p>
            </div>
            <Button variant="secondary" className="bg-white text-indigo-600 border-none px-10 py-6 rounded-2xl font-black shadow-xl">
               View Rewards
            </Button>
         </div>
      </div>
    </motion.div>
  );
};

export default VolunteerDashboard;
