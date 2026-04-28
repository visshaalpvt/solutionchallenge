import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Search, Target, ShieldCheck } from 'lucide-react';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MatchScoreBar from '../../components/matching/MatchScoreBar';
import EmptyState from '../../components/ui/EmptyState';
import useTasksStore from '../../stores/tasksStore';
import useVolunteersStore from '../../stores/volunteersStore';
import { assignTask } from '../../services/firestoreService';
import { matchVolunteers, getMatchLabel } from '../../services/matchingService';

const MatchingPage = () => {
  const tasks = useTasksStore(s => s.tasks);
  const volunteers = useVolunteersStore(s => s.volunteers);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [results, setResults] = useState([]);
  const [hasRun, setHasRun] = useState(false);

  const openTasks = tasks.filter(t => t.status === 'open');
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const runMatching = () => {
    if (!selectedTask) return;
    const matched = matchVolunteers(selectedTask, volunteers);
    setResults(matched);
    setHasRun(true);
  };

  const handleAssign = async (volunteerId) => {
    await assignTask(selectedTaskId, volunteerId);
    setSelectedTaskId('');
    setResults([]);
    setHasRun(false);
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
      className="space-y-8" 
      id="matching-page"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Volunteer Matching</h2>
          <p className="text-slate-500 font-medium mt-1">AI-informed ranking based on skills, zone, and workload.</p>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-end p-2">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Task to Allocate</label>
            <Select 
              id="match-task-select" 
              value={selectedTaskId}
              onChange={(e) => { setSelectedTaskId(e.target.value); setHasRun(false); setResults([]); }}
              className="bg-white border-slate-200 rounded-2xl h-14 text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-100 transition-all"
              options={openTasks.map(t => ({ value: t.id, label: `${t.title} (${t.zone})` }))}
              placeholder="Choose an open task to begin matching..." 
            />
          </div>
          <Button 
            onClick={runMatching} 
            disabled={!selectedTaskId} 
            icon={Zap} 
            id="run-matching-btn"
            size="lg"
            className="rounded-2xl h-14 px-8 shadow-xl shadow-indigo-100 font-black w-full lg:w-auto"
          >
            Find Best Matches
          </Button>
        </div>

        {selectedTask && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-3xl bg-indigo-50 border border-indigo-100 flex flex-col md:flex-row md:items-center gap-6"
          >
            <div className="flex-1">
               <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-900">Task Analysis</span>
               </div>
               <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone</span>
                    <span className="text-xs font-bold text-slate-700">{selectedTask.zone}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Required Skills</span>
                    <span className="text-xs font-bold text-slate-700">{selectedTask.requiredSkills?.join(', ') || 'None specified'}</span>
                  </div>
               </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-indigo-200" />
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-indigo-600" />
               <p className="text-[10px] font-bold text-indigo-700 leading-tight">Optimization active: Prioritizing local proximity and skill relevance.</p>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Results */}
      {hasRun && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-900">{results.length} Candidates Ranked</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort: Match Score</span>
          </div>
          
          {results.length === 0 ? (
            <EmptyState icon={Users} title="No volunteers found" description="Adjust your task requirements or check back later." />
          ) : (
            <div className="space-y-4">
              {results.map((vol, i) => {
                const matchInfo = getMatchLabel(vol.matchScore);
                return (
                  <motion.div
                    key={vol.uid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-slate-100 shadow-sm hover:shadow-xl transition-all p-8 rounded-[2rem] group relative overflow-hidden">
                      {i === 0 && (
                        <div className="absolute top-0 right-0">
                           <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-6 rounded-bl-3xl">
                             Best Match
                           </div>
                        </div>
                      )}
                      
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <span className="absolute -top-2 -left-2 w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg">
                              {i + 1}
                            </span>
                            {vol.photoURL ? (
                              <img src={vol.photoURL} alt={vol.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm border-2 border-white" />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-black text-indigo-600 border-2 border-white">{vol.name?.[0]}</div>
                            )}
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{vol.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{vol.zone || 'No zone'}</p>
                               <span className="text-slate-200">•</span>
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{vol.tasksActive || 0} active tasks</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 w-full lg:w-auto bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <div className="text-right">
                             <p className={`text-[10px] font-black uppercase tracking-widest ${matchInfo.color}`}>{matchInfo.label}</p>
                             <p className="text-3xl font-black text-slate-900 tracking-tighter">{vol.matchScore}<span className="text-sm text-slate-300 ml-0.5">/100</span></p>
                           </div>
                           <Button 
                             variant="primary" 
                             size="md" 
                             onClick={() => handleAssign(vol.uid)}
                             className="rounded-xl px-6 font-black shadow-lg shadow-indigo-100"
                           >
                             Assign Now
                           </Button>
                        </div>
                      </div>

                      <MatchScoreBar breakdown={vol.matchBreakdown} total={vol.matchScore} />
                      
                      <div className="mt-6 flex flex-wrap gap-2">
                        {(vol.skills || []).map(s => (
                          <span key={s} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            {s}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MatchingPage;
