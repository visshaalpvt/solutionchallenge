import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, Briefcase, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import Select from '../../components/ui/Select';
import TaskCard from '../../components/tasks/TaskCard';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
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
  const [confirmTask, setConfirmTask] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [successTask, setSuccessTask] = useState(null);

  // Show ALL tasks — open tasks and assigned tasks (so volunteers see everything)
  const openTasks = tasks.filter(t => {
    // Show everything except completed tasks
    if (t.status === 'completed') return false;
    if (zoneFilter !== 'all' && t.zone !== zoneFilter) return false;
    if (skillFilter !== 'all' && !(t.requiredSkills || []).includes(skillFilter)) return false;
    if (search) {
      const s = search.toLowerCase();
      return t.title?.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s);
    }
    return true;
  });

  const handleAccept = (task) => {
    setConfirmTask(task);
  };

  const confirmAccept = async () => {
    if (!user?.uid || !confirmTask) return;
    setAccepting(true);
    try {
      await acceptTask(confirmTask.id, user.uid);
      setSuccessTask(confirmTask);
      setConfirmTask(null);
      // Auto-dismiss success after 3s
      setTimeout(() => setSuccessTask(null), 3000);
    } catch (err) {
      console.error('Failed to accept task:', err);
      alert('Failed to accept task. Please try again.');
    } finally {
      setAccepting(false);
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
          <p className="text-slate-500 font-medium mt-1">
            Discover opportunities to help your community. 
            <span className="font-bold text-indigo-600 ml-1">{openTasks.length} tasks</span> available.
          </p>
        </div>
      </div>

      {/* Filters */}
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

      {/* Tasks Grid */}
      {openTasks.length === 0 ? (
        <EmptyState 
          title="No tasks available" 
          description="Check back later for new tasks in your area. You'll be notified when new ones appear!" 
        />
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

      {/* ✅ Accept Confirmation Modal */}
      <Modal
        isOpen={!!confirmTask}
        onClose={() => setConfirmTask(null)}
        title="Accept This Task?"
        size="md"
      >
        {confirmTask && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmTask.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{confirmTask.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {confirmTask.zone && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-sm font-bold text-slate-600 border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {confirmTask.zone}
                  </span>
                )}
                {confirmTask.requiredSkills?.map(s => (
                  <span key={s} className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">{s}</span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">Are you sure?</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  By accepting this task, it will be assigned to you and you'll be responsible for completing it. 
                  You can track progress from your "My Tasks" page.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmTask(null)}
                className="flex-1 rounded-2xl py-4"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle2}
                loading={accepting}
                onClick={confirmAccept}
                className="flex-1 rounded-2xl py-4 font-black shadow-xl shadow-indigo-100"
              >
                {accepting ? 'Accepting...' : 'Accept Task'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 🎉 Success Toast */}
      <AnimatePresence>
        {successTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 z-[200]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <span className="font-bold">Task accepted!</span>
              <span className="text-emerald-100 ml-2 text-sm">"{successTask.title}" is now yours.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BrowseTasksPage;
