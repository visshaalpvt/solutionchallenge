import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import NeedCard from '../../components/needs/NeedCard';
import NeedForm from '../../components/needs/NeedForm';
import TaskForm from '../../components/tasks/TaskForm';
import EmptyState from '../../components/ui/EmptyState';
import useNeedsStore from '../../stores/needsStore';
import { CATEGORIES, URGENCY_CONFIG } from '../../config/constants';

const NeedsPage = () => {
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const filters = useNeedsStore(s => s.filters);
  const setFilter = useNeedsStore(s => s.setFilter);
  const getFilteredNeeds = useNeedsStore(s => s.getFilteredNeeds);
  const needs = useNeedsStore(s => s.needs);
  
  const filteredNeeds = React.useMemo(() => getFilteredNeeds(), [getFilteredNeeds, needs, filters]);

  const handleConvertToTask = (need) => {
    setSelectedNeed(need);
    setShowTaskForm(true);
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
      id="needs-page"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community Needs</h2>
          <p className="text-slate-500 font-medium mt-1">Manage and prioritize reported community requirements.</p>
        </div>
        <Button 
          id="create-need-btn" 
          onClick={() => setShowNeedForm(true)} 
          icon={Plus}
          className="rounded-full px-6 py-3 shadow-lg shadow-indigo-100"
        >
          Report New Need
        </Button>
      </div>

      {/* Toolbar */}
      <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search needs by title or description..."
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
          <Select id="filter-urgency" value={filters.urgency} onChange={(e) => setFilter('urgency', e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold"
            options={[{ value: 'all', label: 'All Urgency' }, ...Object.keys(URGENCY_CONFIG).map(k => ({ value: k, label: URGENCY_CONFIG[k].label }))]} />
          <Select id="filter-category" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold"
            options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]} />
          <Select id="filter-status" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold"
            options={[{ value: 'all', label: 'All Status' }, { value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In Progress' }, { value: 'resolved', label: 'Resolved' }]} />
        </div>
      </div>

      {/* Grid */}
      {filteredNeeds.length === 0 ? (
        <EmptyState title="No needs found" description="Adjust your filters or report a new community need." actionLabel="Report Need" onAction={() => setShowNeedForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNeeds.map((need) => (
            <motion.div 
              key={need.id} 
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <NeedCard need={need} onConvertToTask={handleConvertToTask} />
            </motion.div>
          ))}
        </div>
      )}

      <NeedForm isOpen={showNeedForm} onClose={() => setShowNeedForm(false)} />
      <TaskForm isOpen={showTaskForm} onClose={() => { setShowTaskForm(false); setSelectedNeed(null); }} prefillNeed={selectedNeed} />
    </motion.div>
  );
};

export default NeedsPage;
