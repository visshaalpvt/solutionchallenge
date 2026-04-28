import React, { useState } from 'react';
import { Sparkles, MapPin, AlertCircle, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import Input, { TextArea } from '../ui/Input';
import Select from '../ui/Select';
import { MultiSelect } from '../ui/Select';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { CATEGORIES, ZONES } from '../../config/constants';
import { scoreNeed } from '../../services/aiService';
import { createNeed } from '../../services/firestoreService';

const NeedForm = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    zone: '',
    lat: '',
    lng: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [step, setStep] = useState(1); // 1 = form, 2 = AI result preview

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setLoading(true);
      try {
        const result = await scoreNeed(form.title, form.description, form.category);
        setAiResult(result);
        setStep(2);
      } catch (err) {
        console.error('AI scoring failed:', err);
        alert('AI Analysis failed. Please try again or check your API key.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      await createNeed({
        title: form.title,
        description: form.description,
        category: form.category,
        zone: form.zone || 'Global',
        location: {
          lat: parseFloat(form.lat) || 0,
          lng: parseFloat(form.lng) || 0,
        },
        urgencyScore: aiResult.urgencyScore,
        urgencyLabel: aiResult.urgencyLabel,
        aiSummary: aiResult.aiSummary,
        aiSource: aiResult.aiSource,
      });
      setForm({ title: '', description: '', category: '', zone: '', lat: '', lng: '' });
      setAiResult(null);
      setStep(1);
      onClose();
    } catch (err) {
      console.error('Failed to create need:', err);
      alert(`Failed to save: ${err.message}\n\nFIX: Go to Firebase Console → Firestore Database → Rules tab → Replace rules with:\n\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n\nThen click "Publish".`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setAiResult(null);
    onClose();
  };

  const urgencyColors = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-amber-600',
    low: 'text-emerald-600',
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={step === 1 ? 'Report Community Need' : 'AI Analysis Results'} 
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          <>
            <div className="space-y-4">
              <Input
                id="need-title"
                label="Primary Requirement"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Emergency Medical Supplies Needed"
                required
              />

              <TextArea
                id="need-description"
                label="Detailed Context"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Provide a thorough description of the situation..."
                required
                rows={4}
              />

              <div className="grid grid-cols-2 gap-6">
                <Select
                  id="need-category"
                  label="Category"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  options={CATEGORIES}
                  placeholder="Select"
                  required
                />
                <Select
                  id="need-zone"
                  label="Target Zone"
                  value={form.zone}
                  onChange={(e) => handleChange('zone', e.target.value)}
                  options={ZONES}
                  placeholder="Select"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input
                  id="need-lat"
                  label="Latitude (optional)"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => handleChange('lat', e.target.value)}
                  placeholder="e.g., 12.9716"
                />
                <Input
                  id="need-lng"
                  label="Longitude (optional)"
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => handleChange('lng', e.target.value)}
                  placeholder="e.g., 77.5946"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
              <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-900">AI-Powered Prioritization</p>
                <p className="text-[10px] text-indigo-700/70 font-medium mt-1 leading-relaxed">
                  Our AI engine (Groq LLaMA + Gemini) will evaluate this report to determine urgency, impact potential, and resource requirements automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose} className="flex-1 rounded-2xl py-4">
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} icon={Sparkles} className="flex-1 rounded-2xl py-4 font-black shadow-xl shadow-indigo-100">
                {loading ? 'AI analyzing situation...' : 'Analyze with AI'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Report Overview</h3>
                <p className="text-lg font-bold text-slate-900 mb-2">{form.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{form.description}</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-white border border-indigo-100 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles className="w-20 h-20 text-indigo-600" />
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">AI Assessment Result</h3>
                  {aiResult?.aiSource && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[9px] font-bold text-indigo-600 uppercase border border-indigo-100">
                      via {aiResult.aiSource}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority Score</p>
                    <p className={`text-5xl font-black ${urgencyColors[aiResult?.urgencyLabel] || 'text-slate-900'} tracking-tighter`}>
                      {aiResult?.urgencyScore}<span className="text-sm text-slate-300 ml-1">/10</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Urgency Label</p>
                    <p className={`text-2xl font-black capitalize ${urgencyColors[aiResult?.urgencyLabel] || 'text-slate-900'}`}>
                      {aiResult?.urgencyLabel}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                       <AlertCircle className={`w-4 h-4 ${urgencyColors[aiResult?.urgencyLabel]}`} />
                       <span className="text-[10px] font-bold text-slate-500">Requires immediate attention</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Summary & Recommendation</p>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{aiResult?.aiSummary}"</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" icon={ArrowLeft} onClick={() => setStep(1)} className="flex-1 rounded-2xl py-4">
                Edit Report
              </Button>
              <Button type="submit" variant="primary" loading={loading} icon={CheckCircle2} className="flex-1 rounded-2xl py-4 font-black shadow-xl shadow-indigo-100">
                {loading ? 'Submitting...' : 'Confirm & Save Report'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default NeedForm;
