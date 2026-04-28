import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Shield, Zap, Gift, ChevronRight, Award } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const BADGES = [
  { id: 'rookie', title: 'Community Rookie', icon: Shield, color: 'text-slate-400', bg: 'bg-slate-50', points: 0, unlocked: true },
  { id: 'helper', title: 'Local Hero', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', points: 100, unlocked: false },
  { id: 'elite', title: 'Impact Elite', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', points: 500, unlocked: false },
  { id: 'legend', title: 'Global Legend', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', points: 1000, unlocked: false },
];

const RewardsModal = ({ isOpen, onClose, completedCount = 0 }) => {
  const points = completedCount * 50;
  const nextMilestone = BADGES.find(b => b.points > points) || BADGES[BADGES.length - 1];
  const progress = Math.min((points / nextMilestone.points) * 100, 100) || 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Volunteer Rewards & Impact" size="lg">
      <div className="space-y-8">
        {/* Points Header */}
        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Trophy size={120} />
          </div>
          <div className="relative z-10">
             <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Your Impact Balance</p>
             <h3 className="text-5xl font-black mb-6">{points} <span className="text-xl opacity-60">PTS</span></h3>
             
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                   <span>Level Progress</span>
                   <span>{Math.round(progress)}% to {nextMilestone.title}</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 px-1">Achievement Badges</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = points >= badge.points;
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center ${
                    isUnlocked ? `${badge.bg} border-transparent shadow-lg` : 'bg-white border-slate-50 opacity-40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isUnlocked ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                    <Icon className={`w-6 h-6 ${isUnlocked ? badge.color : 'text-slate-300'}`} />
                  </div>
                  <p className="text-[10px] font-black text-slate-900 leading-tight uppercase tracking-tight">{badge.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Perks Section */}
        <div className="space-y-4">
           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest px-1">Available Perks</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                 <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Gift size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">Premium Certificate</p>
                    <p className="text-[10px] text-slate-400">Unlock at 500 points</p>
                 </div>
                 <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                 <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Zap size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">Priority Matching</p>
                    <p className="text-[10px] text-slate-400">Unlock at 200 points</p>
                 </div>
                 <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
           </div>
        </div>

        <Button onClick={onClose} variant="secondary" className="w-full py-4 rounded-2xl font-black">
          Continue Impact
        </Button>
      </div>
    </Modal>
  );
};

export default RewardsModal;
