import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, Briefcase } from 'lucide-react';
import Select from '../../components/ui/Select';
import TaskCard from '../../components/tasks/TaskCard';
import EmptyState from '../../components/ui/EmptyState';
import useTasksStore from '../../stores/tasksStore';
import useAuthStore from '../../stores/authStore';
import useVolunteersStore from '../../stores/volunteersStore';
import { acceptTask } from '../../services/firestoreService';
import { ZONES, SKILLS } from '../../config/constants';

const BrowseTasksPage = () => {
  const user = useAuthStore(s => s.user);
  const tasks = useTasksStore(s => s.tasks);
  const volunteers = useVolunteersStore(s => s.volunteers);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  const openTasks = tasks.filter(t => {
    if (t.status !== 'open') return false;
    if (zoneFilter !== 'all' && t.zone !== zoneFilter) return false;
    if (skillFilter !== 'all' && !(t.requiredSkills || []).includes(skillFilter)) return false;
    if (search) {
      const s = search.toLowerCase();
      return t.title?.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s);
    }
    return true;
  });

  const handleAccept = async (task) => {
    if (user?.uid) {
      await acceptTask(task.id, user.uid);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8" 
      id="browse-tasks-page"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Tasks</h2>
          <p className="text-slate-500 font-medium mt-1">Discover opportunities to help your community based on your skills.</p>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title or requirements..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-sm font-medium" 
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
             <SlidersHorizontal className="w-4 h-4 text-slate-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters</span>
          </div>
          <Select 
            value={zoneFilter} 
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold"
            options={[{ value: 'all', label: 'All Zones' }, ...ZONES.map(z => ({ value: z, label: z }))]} 
          />
          <Select 
            value={skillFilter} 
            onChange={(e) => setSkillFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold"
            options={[{ value: 'all', label: 'All Skills' }, ...SKILLS.map(s => ({ value: s, label: s }))]} 
          />
        </div>
      </div>

      {openTasks.length === 0 ? (
        <EmptyState title="No tasks available" description="Check back later for new tasks in your area." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {openTasks.map((task) => (
            <motion.div 
              key={task.id} 
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <TaskCard task={task} onAccept={handleAccept} volunteers={volunteers} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BrowseTasksPage;
