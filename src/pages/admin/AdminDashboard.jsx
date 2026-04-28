import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  MapPin,
  Clock,
  ExternalLink,
  Target,
  Brain,
  Bot,
  ChevronRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import useNeedsStore from '../../stores/needsStore';
import useTasksStore from '../../stores/tasksStore';
import useVolunteersStore from '../../stores/volunteersStore';
import useAuthStore from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { getAIInsight } from '../../services/groqService';

const AdminDashboard = () => {
  const user = useAuthStore(s => s.user);
  const needs = useNeedsStore(s => s.needs);
  const tasks = useTasksStore(s => s.tasks);
  const volunteers = useVolunteersStore(s => s.volunteers);
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const needStats = useMemo(() => ({
    total: needs.length,
    critical: needs.filter(n => n.urgencyLabel === 'critical').length,
    high: needs.filter(n => n.urgencyLabel === 'high').length,
    medium: needs.filter(n => n.urgencyLabel === 'medium').length,
    low: needs.filter(n => n.urgencyLabel === 'low').length,
  }), [needs]);

  const taskStats = useMemo(() => ({
    open: tasks.filter(t => t.status === 'open').length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }), [tasks]);

  const volStats = useMemo(() => ({
    total: volunteers.length,
    active: volunteers.filter(v => (v.tasksActive || 0) > 0).length,
  }), [volunteers]);

  const recentNeeds = needs.slice(0, 5);
  const completionRate = tasks.length > 0 ? Math.round((taskStats.completed / tasks.length) * 100) : 0;

  // 🤖 Fetch AI Insight on load
  useEffect(() => {
    const fetchInsight = async () => {
      if (needs.length === 0 && tasks.length === 0) return;
      setLoadingInsight(true);
      const context = `Dashboard summary: ${needStats.total} total needs (${needStats.critical} critical, ${needStats.high} high priority). ${taskStats.open} unassigned tasks, ${taskStats.assigned} in progress, ${taskStats.completed} completed. ${volStats.total} volunteers registered (${volStats.active} currently active). Completion rate: ${completionRate}%.`;
      const insight = await getAIInsight(context);
      setAiInsight(insight);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, [needs.length, tasks.length, volunteers.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-1"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{user?.name?.split(' ')[0] || 'Admin'}</span>
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            {needStats.critical > 0 
              ? `${needStats.critical} critical needs require your attention.`
              : 'System status is normal. All systems operational.'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" icon={ClipboardList} onClick={() => navigate('/admin/tasks')} className="bg-white border-slate-200">
            View Tasks
          </Button>
          <Button variant="primary" size="md" icon={Sparkles} onClick={() => navigate('/admin/needs')} className="shadow-lg shadow-indigo-100 px-6">
            New Allocation
          </Button>
        </div>
      </motion.div>

      {/* 🤖 AI INSIGHT CARD */}
      <AnimatePresence>
        {(aiInsight || loadingInsight) && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="rounded-[2rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-black text-indigo-100 uppercase tracking-widest">AI Insight</p>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-white/80 uppercase">Powered by Groq</span>
                  </div>
                  {loadingInsight ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <p className="text-sm text-white/70 font-medium">Analyzing your data...</p>
                    </div>
                  ) : (
                    <p className="text-sm text-white/90 leading-relaxed font-medium">{aiInsight}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Needs" value={needStats.total} icon={AlertTriangle} color="accent-primary" delay={0} />
        <StatCard title="Critical Priority" value={needStats.critical} icon={TrendingUp} color="urgency-critical" delay={100} />
        <StatCard title="Active Volunteers" value={volStats.total} icon={Users} color="success" delay={200} />
        <StatCard title="Open Tasks" value={taskStats.open} icon={ClipboardList} color="warning" delay={300} />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Needs — 2 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <Card hover={false} padding="p-0" className="overflow-hidden border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/30">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Community Needs</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Feed</p>
              </div>
              <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => navigate('/admin/needs')} className="text-indigo-600 font-bold">
                Manage All
              </Button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentNeeds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-lg font-bold text-slate-900">Clear for now</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-[240px] text-center">No new needs have been reported yet.</p>
                </div>
              ) : (
                recentNeeds.map((need, i) => (
                  <motion.div 
                    key={need.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/admin/needs')}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        need.urgencyLabel === 'critical' ? 'bg-red-50 text-red-600' :
                        need.urgencyLabel === 'high' ? 'bg-orange-50 text-orange-600' :
                        need.urgencyLabel === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                      }`}>
                         <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{need.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                           <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3" />
                              {need.zone || 'Global'}
                           </p>
                           <span className="text-slate-200">•</span>
                           <p className="text-xs text-slate-400 font-medium">{need.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge urgency={need.urgencyLabel} />
                      <div className="h-8 w-px bg-slate-100 mx-2" />
                      <button className="p-2 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>

          {/* ⚡ LIVE OPERATIONAL LOG */}
          <Card className="border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Live Operational Log
                </h3>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Live Feed</span>
                </span>
             </div>
             <div className="space-y-6">
                {tasks.filter(t => t.status !== 'open').slice(0, 4).map((task, i) => (
                   <div key={task.id} className="flex gap-4 relative">
                      {i !== 3 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-100" />}
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${
                        task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                         {task.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-bold text-slate-900">
                            {task.status === 'completed' ? 'Task Completed' : 'Task In Progress'} 
                            <span className="text-slate-400 font-medium ml-1">in {task.zone}</span>
                         </p>
                         <p className="text-[11px] text-slate-500 mt-0.5">{task.title}</p>
                         <p className="text-[9px] font-black text-indigo-500 uppercase mt-2 tracking-widest">
                            {task.status === 'assigned' ? 'Volunteer En Route' : 'Impact Logged'}
                         </p>
                      </div>
                   </div>
                ))}
                {tasks.length === 0 && (
                   <p className="text-center py-4 text-xs font-bold text-slate-300 uppercase italic">Awaiting operational movements...</p>
                )}
             </div>
          </Card>
        </motion.div>

        {/* Right Column — Insights Panels */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Task Status */}
          <Card className="border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              Allocation Pipeline
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Unassigned', value: taskStats.open, color: 'bg-amber-100 text-amber-700' },
                { label: 'In Progress', value: taskStats.assigned, color: 'bg-indigo-100 text-indigo-700' },
                { label: 'Completed', value: taskStats.completed, color: 'bg-emerald-100 text-emerald-700' },
              ].map(item => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                  onClick={() => navigate('/admin/tasks')}
                >
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item.label}</span>
                  <span className={`text-sm font-black px-3 py-1 rounded-lg ${item.color}`}>{item.value}</span>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* 👥 VOLUNTEER LIST */}
          <Card hover={false} padding="p-0" className="border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Volunteers</h3>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black">{volStats.total}</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[320px] overflow-y-auto custom-scrollbar">
              {volunteers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Users className="w-8 h-8 text-slate-200 mb-3" />
                  <p className="text-xs font-bold text-slate-400 text-center">No volunteers registered yet</p>
                  <p className="text-[10px] text-slate-400 mt-1">They'll appear here when they log in</p>
                </div>
              ) : (
                volunteers.map((vol, i) => (
                  <motion.div
                    key={vol.uid || vol.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group"
                  >
                    {vol.photoURL ? (
                      <img src={vol.photoURL} alt={vol.name} className="w-8 h-8 rounded-xl object-cover border border-slate-100" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600">
                        {vol.name?.[0] || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{vol.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{vol.zone || 'No zone'}</span>
                        {(vol.tasksActive || 0) > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-[8px] font-bold text-indigo-600">
                            {vol.tasksActive} active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {(vol.skills || []).slice(0, 2).map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-bold text-slate-500 hidden lg:block">{s}</span>
                      ))}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
              <button onClick={() => navigate('/admin/matching')} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 mx-auto">
                <Zap className="w-3 h-3" /> Match Volunteers to Tasks
              </button>
            </div>
          </Card>

          {/* 📍 ZONE DISTRIBUTION HEATMAP */}
          <Card className="border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Regional Heatmap
            </h3>
            <div className="space-y-3">
              {['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'].map(z => {
                const count = needs.filter(n => n.zone === z).length;
                const percentage = needs.length > 0 ? (count / needs.length) * 100 : 0;
                const isEastOnProcess = tasks.some(t => t.zone === 'East Zone' && t.status === 'assigned');
                
                return (
                  <div key={z} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-600 flex items-center gap-1">
                        {z}
                        {z === 'East Zone' && isEastOnProcess && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        )}
                      </span>
                      <span className="text-slate-400">{count} Items</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         className={`h-full rounded-full ${z === 'East Zone' && isEastOnProcess ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-slate-300'}`}
                       />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Impact Progress Ring */}
          <Card className="border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Target className="w-4 h-4 text-indigo-600" />
              Impact Target
            </h3>
            <div className="flex flex-col items-center py-4">
              <div className="relative w-32 h-32 mb-6">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                   <motion.circle
                     cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                     strokeDasharray={364}
                     initial={{ strokeDashoffset: 364 }}
                     animate={{ strokeDashoffset: 364 - (364 * (completionRate / 100)) }}
                     transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                     className="text-indigo-600"
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-2xl font-black text-slate-900"
                    >
                      {completionRate}%
                    </motion.span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Completion</span>
                 </div>
              </div>
              <p className="text-xs text-slate-500 text-center px-4 leading-relaxed font-medium">
                <span className="text-slate-900 font-bold">{taskStats.completed}</span> tasks completed out of <span className="text-slate-900 font-bold">{tasks.length}</span> total.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
