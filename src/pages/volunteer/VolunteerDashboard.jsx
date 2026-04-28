import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, Clock, MapPin, Search, ArrowRight, Star, Heart } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import useAuthStore from '../../stores/authStore';
import useTasksStore from '../../stores/tasksStore';
import useNeedsStore from '../../stores/needsStore';
import { useNavigate } from 'react-router-dom';

const VolunteerDashboard = () => {
  const user = useAuthStore(s => s.user);
  const tasks = useTasksStore(s => s.tasks);
  const needs = useNeedsStore(s => s.needs);
  const navigate = useNavigate();

  const myTasks = tasks.filter(t => t.assignedTo === user?.uid);
  const activeTasks = myTasks.filter(t => t.status === 'assigned');
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const nearbyNeeds = needs.filter(n => n.zone === user?.zone && n.status === 'open').slice(0, 5);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Active Assignments" value={activeTasks.length} icon={Briefcase} color="accent-primary" delay={0} />
        <StatCard title="Impact Score" value={completedTasks.length * 10} icon={Star} color="success" delay={100} />
        <StatCard title="Local Opportunities" value={nearbyNeeds.length} icon={Heart} color="urgency-critical" delay={200} />
      </div>

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
          <div className="divide-y divide-slate-100 min-h-[300px]">
            {activeTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6">
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

        {/* Nearby Needs */}
        <Card hover={false} padding="p-0" className="border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Nearby Opportunities</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Based on {user?.zone || 'Zone'}</p>
            </div>
            <Heart className="w-5 h-5 text-red-400 fill-red-400/10" />
          </div>
          <div className="divide-y divide-slate-100 min-h-[300px]">
            {nearbyNeeds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-500">No urgent needs in your zone.</p>
                <p className="text-[10px] text-slate-400 mt-1">Try updating your location in settings.</p>
              </div>
            ) : (
              nearbyNeeds.map(need => (
                <div key={need.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate('/volunteer/browse')}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{need.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{need.category}</p>
                         <Badge urgency={need.urgencyLabel} className="scale-90 origin-left" />
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
