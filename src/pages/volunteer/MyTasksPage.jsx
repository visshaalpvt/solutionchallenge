import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Briefcase, History, Award } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import useAuthStore from '../../stores/authStore';
import useTasksStore from '../../stores/tasksStore';
import { completeTask } from '../../services/firestoreService';
import CertificateModal from '../../components/rewards/CertificateModal';
import { useState } from 'react';
import confetti from 'canvas-confetti';

const MyTasksPage = () => {
  const [showCert, setShowCert] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const user = useAuthStore(s => s.user);
  const tasks = useTasksStore(s => s.tasks);
  const myTasks = tasks.filter(t => t.assignedTo === user?.uid);
  const active = myTasks.filter(t => t.status === 'assigned');
  const completed = myTasks.filter(t => t.status === 'completed');

  const handleComplete = async (task) => {
    if (user?.uid) {
      try {
        // 🎉 Trigger Celebration immediately
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#9333ea', '#10b981']
        });

        await completeTask(task.id, user.uid);
        
        // Small delay to ensure state is ready
        setTimeout(() => {
          setSelectedTask(task);
          setShowCert(true);
        }, 500);

      } catch (error) {
        console.error('Completion Error:', error);
        alert('Could not complete task. Please try again.');
      }
    }
  };

  const openCert = (task) => {
    setSelectedTask(task);
    setShowCert(true);
  };

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
      className="space-y-12" 
      id="my-tasks-page"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Assignments</h2>
          <p className="text-slate-500 font-medium mt-1">Track your active contributions and historical impact.</p>
        </div>
      </div>

      {/* Active Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Active Tasks</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{active.length} In Progress</p>
          </div>
        </div>
        
        {active.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <div className="text-center py-12">
               <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-sm font-bold text-slate-500">No active tasks assigned to you right now.</p>
               <p className="text-xs text-slate-400 mt-1">Visit the Browse page to find new opportunities.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {active.map(task => (
              <motion.div key={task.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-8 border-slate-100 shadow-sm hover:shadow-xl transition-all rounded-[2rem] flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <StatusBadge status={task.status} />
                    {task.urgencyScore && (
                      <span className="text-sm font-black text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg">{task.urgencyScore}/10</span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{task.title}</h4>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-3">{task.description}</p>
                  
                  {task.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {task.requiredSkills.map(s => (
                        <span key={s} className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    <Button 
                      variant="success" 
                      size="lg" 
                      icon={CheckCircle2} 
                      onClick={() => handleComplete(task)} 
                      className="w-full rounded-2xl py-4 font-black shadow-lg shadow-emerald-100"
                    >
                      Complete Task
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
            <History className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Task History</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{completed.length} Completed</p>
          </div>
        </div>
        
        {completed.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
             <p className="text-sm font-bold text-slate-400">Your history is clear. Complete tasks to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map(task => (
              <Card key={task.id} className="opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-slate-100 bg-slate-50/30 p-6 rounded-[1.5rem] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={task.status} />
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">{task.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">{task.description}</p>
                </div>
                <button 
                  onClick={() => openCert(task)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Award size={14} /> View Certificate
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CertificateModal 
        isOpen={showCert} 
        onClose={() => setShowCert(false)} 
        task={selectedTask} 
        userName={user?.name || 'Humanitarian Volunteer'} 
      />
    </motion.div>
  );
};

export default MyTasksPage;
