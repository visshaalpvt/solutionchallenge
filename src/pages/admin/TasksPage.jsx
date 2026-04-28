import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, SlidersHorizontal, UserCheck, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import TaskCard from '../../components/tasks/TaskCard';
import TaskForm from '../../components/tasks/TaskForm';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import MatchScoreBar from '../../components/matching/MatchScoreBar';
import useTasksStore from '../../stores/tasksStore';
import useVolunteersStore from '../../stores/volunteersStore';
import { assignTask } from '../../services/firestoreService';
import { matchVolunteers } from '../../services/matchingService';
import { ZONES } from '../../config/constants';

const TasksPage = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const filters = useTasksStore(s => s.filters);
  const setFilter = useTasksStore(s => s.setFilter);
  const getFilteredTasks = useTasksStore(s => s.getFilteredTasks);
  const tasks = useTasksStore(s => s.tasks);
  const volunteers = useVolunteersStore(s => s.volunteers);
  
  const filteredTasks = React.useMemo(() => getFilteredTasks(), [getFilteredTasks, tasks, filters]);

  const handleAssign = (task) => {
    const matched = matchVolunteers(task, volunteers);
    setAssignModal({ task, matched });
  };

  const confirmAssign = async (volunteerId) => {
    if (assignModal) {
      await assignTask(assignModal.task.id, volunteerId);
      setAssignModal(null);
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
      id="tasks-page"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Task Management</h2>
          <p className="text-slate-500 font-medium mt-1">Coordinate and monitor active volunteer operations.</p>
        </div>
        <Button 
          id="create-task-btn" 
          onClick={() => setShowTaskForm(true)} 
          icon={Plus}
          className="rounded-full px-6 py-3 shadow-lg shadow-indigo-100"
        >
          Create New Task
        </Button>
      </div>

      {/* Toolbar */}
      <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-sm font-medium" 
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
             <SlidersHorizontal className="w-4 h-4 text-slate-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters</span>
          </div>
          <Select id="filter-task-status" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold"
            options={[{ value: 'all', label: 'All Status' }, { value: 'open', label: 'Open' }, { value: 'assigned', label: 'Assigned' }, { value: 'completed', label: 'Completed' }]} />
          <Select id="filter-task-zone" value={filters.zone} onChange={(e) => setFilter('zone', e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold"
            options={[{ value: 'all', label: 'All Zones' }, ...ZONES.map(z => ({ value: z, label: z }))]} />
        </div>
      </div>

      {/* Grid */}
      {filteredTasks.length === 0 ? (
        <EmptyState title="No tasks found" description="Create tasks from community needs or report a new need." actionLabel="Create Task" onAction={() => setShowTaskForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <motion.div 
              key={task.id} 
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <TaskCard task={task} onAssign={handleAssign} volunteers={volunteers} />
            </motion.div>
          ))}
        </div>
      )}

      <TaskForm isOpen={showTaskForm} onClose={() => setShowTaskForm(false)} />

      {/* Assign Modal */}
      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Volunteer" size="lg" className="rounded-[2.5rem]">
        {assignModal && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-1">Target Task</p>
                <p className="text-sm font-bold text-slate-900">{assignModal.task.title}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <UserPlus className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Top Matches</p>
              {assignModal.matched.length === 0 ? (
                <div className="text-center py-12 px-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-bold text-slate-500">No registered volunteers yet. Volunteers will appear here once they log in.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {assignModal.matched.map(vol => (
                    <div key={vol.uid} className="p-5 rounded-3xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {vol.photoURL ? (
                            <img src={vol.photoURL} alt={vol.name} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-600">{vol.name?.[0]}</div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-900">{vol.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{vol.zone} • {vol.tasksActive || 0} active</p>
                          </div>
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => confirmAssign(vol.uid)}
                          className="rounded-xl px-4 font-black"
                        >
                          Assign
                        </Button>
                      </div>
                      <MatchScoreBar breakdown={vol.matchBreakdown} total={vol.matchScore} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default TasksPage;
