import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import Input, { TextArea } from '../ui/Input';
import Select from '../ui/Select';
import { MultiSelect } from '../ui/Select';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { ZONES, SKILLS } from '../../config/constants';
import { createTask } from '../../services/firestoreService';

const TaskForm = ({ isOpen, onClose, prefillNeed = null }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    zone: '',
    needId: '',
    urgencyScore: 5,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefillNeed) {
      setForm({
        title: prefillNeed.title || '',
        description: prefillNeed.description || '',
        requiredSkills: [],
        zone: prefillNeed.zone || '',
        needId: prefillNeed.id || '',
        urgencyScore: prefillNeed.urgencyScore || 5,
      });
    }
  }, [prefillNeed]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTask(form);
      setForm({
        title: '',
        description: '',
        requiredSkills: [],
        zone: '',
        needId: '',
        urgencyScore: 5,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Operation Task"
      size="lg"
      id="task-form-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {prefillNeed && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
               <AlertCircle className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xs font-bold text-indigo-900">
              Allocating resources for need:{' '}
              <span className="text-indigo-600 underline decoration-indigo-200">{prefillNeed.title}</span>
            </p>
          </div>
        )}

        <div className="space-y-5">
          <Input
            id="task-title"
            label="Task Name"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Deliver Emergency Rations"
            required
          />

          <TextArea
            id="task-description"
            label="Operational Instructions"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Detailed steps for the assigned volunteer..."
            required
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="task-zone"
              label="Operational Zone"
              value={form.zone}
              onChange={(e) => handleChange('zone', e.target.value)}
              options={ZONES}
              placeholder="Select zone"
              required
            />
             <div className="flex flex-col">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Priority Level</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                   <input 
                     type="range" 
                     min="1" max="10" 
                     value={form.urgencyScore} 
                     onChange={(e) => handleChange('urgencyScore', parseInt(e.target.value))}
                     className="flex-1 accent-indigo-600"
                   />
                   <span className="text-sm font-black text-slate-900 min-w-[20px]">{form.urgencyScore}</span>
                </div>
             </div>
          </div>

          <MultiSelect
            id="task-skills"
            label="Required Expertise"
            selected={form.requiredSkills}
            onChange={(val) => handleChange('requiredSkills', val)}
            options={SKILLS}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 rounded-2xl py-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Briefcase}
            className="flex-1 rounded-2xl py-4 font-black shadow-xl shadow-indigo-100"
          >
            {loading ? 'Creating task...' : 'Deploy Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
