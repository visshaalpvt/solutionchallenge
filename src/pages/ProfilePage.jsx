import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, MapPin, Calendar, Star, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { MultiSelect } from '../components/ui/Select';
import useAuthStore from '../stores/authStore';
import { updateUser } from '../services/firestoreService';
import { ZONES, SKILLS, AVAILABILITY } from '../config/constants';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    skills: [],
    availability: [],
    zone: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        skills: user.skills || [],
        availability: user.availability || [],
        zone: user.zone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await updateUser(user.uid, form);
      setUser({ ...user, ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-10" 
      id="profile-page"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center md:text-left">Profile Settings</h2>
          <p className="text-slate-500 font-medium mt-1 text-center md:text-left">Configure your skills and availability for optimized matching.</p>
        </div>
        <Button 
          onClick={handleSave} 
          loading={saving} 
          icon={Save} 
          id="save-profile-btn"
          className="rounded-2xl px-10 py-4 shadow-xl shadow-indigo-100 font-black"
        >
          {saving ? 'Saving Changes...' : 'Save Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          {/* User Info */}
          <Card className="text-center p-8 bg-gradient-to-br from-indigo-600 to-purple-600 border-none shadow-xl shadow-indigo-100">
            <div className="flex flex-col items-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white/20 shadow-2xl mb-6" />
              ) : (
                <div className="w-24 h-24 rounded-[2rem] bg-white/20 flex items-center justify-center mb-6">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{user?.name}</h3>
              <p className="text-indigo-100 text-xs font-medium mb-4 opacity-80">{user?.email}</p>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                {user?.role}
              </span>
            </div>
          </Card>

          {/* Activity Stats */}
          <Card className="border-slate-100 shadow-sm p-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Star className="w-4 h-4 text-indigo-600" />
               Impact Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                <span className="text-lg font-black text-slate-900">{user?.tasksCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active</span>
                <span className="text-lg font-black text-indigo-600">{user?.tasksActive || 0}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* Skills */}
          <Card className="border-slate-100 shadow-sm p-8 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-indigo-600" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">Skills & Expertise</h3>
            </div>
            <MultiSelect
              id="profile-skills"
              selected={form.skills}
              onChange={(val) => setForm(prev => ({ ...prev, skills: val }))}
              options={SKILLS}
            />
          </Card>

          {/* Availability */}
          <Card className="border-slate-100 shadow-sm p-8 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">Schedule</h3>
            </div>
            <MultiSelect
              id="profile-availability"
              selected={form.availability}
              onChange={(val) => setForm(prev => ({ ...prev, availability: val }))}
              options={AVAILABILITY}
            />
          </Card>

          {/* Zone */}
          <Card className="border-slate-100 shadow-sm p-8 rounded-[2rem]">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">Primary Operating Zone</h3>
            </div>
            <Select
              id="profile-zone"
              value={form.zone}
              onChange={(e) => setForm(prev => ({ ...prev, zone: e.target.value }))}
              options={ZONES}
              placeholder="Select your primary zone"
            />
          </Card>
        </div>
      </div>

      {saved && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 z-[200]"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">Profile updated successfully!</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfilePage;
