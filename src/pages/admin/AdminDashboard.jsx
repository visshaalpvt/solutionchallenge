import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Target
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

const AdminDashboard = () => {
  const user = useAuthStore(s => s.user);
  const needs = useNeedsStore(s => s.needs);
  const tasks = useTasksStore(s => s.tasks);
  const volunteers = useVolunteersStore(s => s.volunteers);
  const navigate = useNavigate();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-1"
    >
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{user?.name?.split(' ')[0] || 'Admin'}</span>
          </h2>
          <p className="text-slate-500 mt-1 font-medium">System status is normal. 4 critical needs require your attention.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" icon={ClipboardList} onClick={() => navigate('/admin/tasks')} className="bg-white border-slate-200">
            Export Report
          </Button>
          <Button variant="primary" size="md" icon={Sparkles} onClick={() => navigate('/admin/needs')} className="shadow-lg shadow-indigo-100 px-6">
            New Allocation
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Needs" value={needStats.total} icon={AlertTriangle} color="accent-primary" delay={0} />
        <StatCard title="Critical Priority" value={needStats.critical} icon={TrendingUp} color="urgency-critical" delay={100} />
        <StatCard title="Active Volunteers" value={volStats.active} icon={Users} color="success" delay={200} />
        <StatCard title="Open Tasks" value={taskStats.open} icon={ClipboardList} color="warning" delay={300} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Needs — 2 cols */}
        <div className="lg:col-span-2">
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
                  <p className="text-sm text-slate-400 mt-1 max-w-[240px] text-center">No new needs have been reported in the last 24 hours.</p>
                </div>
              ) : (
                recentNeeds.map((need, i) => (
                  <div key={need.id} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
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
                  </div>
                ))
              )}
            </div>
            {recentNeeds.length > 0 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                 <button onClick={() => navigate('/admin/needs')} className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                   Load more activity...
                 </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column — Insights Panels */}
        <div className="space-y-6">
          {/* Target Progress */}
          <Card className="border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Target className="w-4 h-4 text-indigo-600" />
              Impact Target
            </h3>
            <div className="flex flex-col items-center py-4">
              <div className="relative w-32 h-32 mb-6">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                   <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * 0.75)} className="text-indigo-600" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">75%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Resolved</span>
                 </div>
              </div>
              <p className="text-xs text-slate-500 text-center px-4 leading-relaxed font-medium">
                You've resolved <span className="text-slate-900 font-bold">120 needs</span> this month. Only 40 remaining to reach goal.
              </p>
            </div>
          </Card>

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
                <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item.label}</span>
                  <span className={`text-sm font-black px-3 py-1 rounded-lg ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Stats Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-100">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                 <Users className="w-5 h-5 text-white" />
               </div>
               <div>
                 <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Active Pool</p>
                 <p className="text-lg font-black">{volStats.total} Volunteers</p>
               </div>
             </div>
             <p className="text-xs text-indigo-100 leading-relaxed opacity-80 mb-4">
               Your volunteer network is growing. 12 new members joined this week.
             </p>
             <Button variant="secondary" size="sm" className="w-full bg-white text-indigo-600 border-none font-bold py-3 hover:bg-indigo-50">
               Invite More
             </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
