import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, X, ShieldCheck, Star } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const CertificateModal = ({ isOpen, onClose, task, userName }) => {
  if (!isOpen || !task) return null;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Recognition"
      size="xl"
    >
      <div className="relative overflow-hidden">
          {/* Certificate Content (Printable Area) */}
          <div className="p-8 md:p-12 relative bg-white" id="printable-certificate">
             {/* Decorative Border */}
             <div className="absolute inset-4 border-[8px] border-double border-indigo-50 pointer-events-none" />
             
             {/* Background Watermark */}
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award size={400} className="text-indigo-900" />
             </div>

             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6 shadow-inner">
                   <ShieldCheck size={40} className="text-indigo-600" />
                </div>

                <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 mb-4">Certificate of Completion</h1>
                
                <p className="text-slate-400 text-xs font-medium mb-1 italic">This is to officially recognize that</p>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 font-serif tracking-tight">{userName}</h2>
                
                <p className="max-w-lg text-xs text-slate-500 font-medium leading-relaxed mb-8">
                   Has successfully demonstrated exceptional commitment and community leadership by completing the humanitarian mission:
                   <span className="block text-indigo-600 font-black mt-2 text-base uppercase tracking-wide">"{task.title}"</span>
                </p>

                <div className="grid grid-cols-2 gap-12 mt-8 w-full max-w-xl">
                   <div className="flex flex-col items-center">
                      <div className="w-full border-b border-slate-200 pb-1 mb-1">
                         <span className="text-xl font-serif italic text-slate-800" style={{ fontFamily: "'Dancing Script', cursive" }}>
                            Visshaal
                         </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Project Director</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="w-full border-b border-slate-200 pb-1 mb-1">
                         <span className="text-xs font-bold text-slate-800">{date}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date of Achievement</span>
                   </div>
                </div>

                {/* Badge Seal */}
                <div className="absolute bottom-4 right-4 transform rotate-12">
                   <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-amber-500 shadow-xl flex items-center justify-center relative">
                      <div className="absolute inset-1 border border-dashed border-white/40 rounded-full" />
                      <Star size={28} className="text-white fill-current" />
                   </div>
                </div>
             </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500">Verified by SmartAlloc Protocol</span>
             </div>
             <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="secondary" icon={Share2} size="md" className="flex-1 sm:flex-none">
                   Share
                </Button>
                <Button variant="primary" icon={Download} onClick={handlePrint} size="md" className="flex-1 sm:flex-none shadow-lg shadow-indigo-100">
                   Download PDF
                </Button>
             </div>
          </div>
      </div>
    </Modal>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-certificate, #printable-certificate * { visibility: visible; }
          #printable-certificate { position: absolute; left: 0; top: 0; width: 100%; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
      `}</style>
    </AnimatePresence>
  );
};

export default CertificateModal;
