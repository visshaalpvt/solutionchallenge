import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, SlidersHorizontal, Info } from 'lucide-react';
import Select from '../../components/ui/Select';
import MapView from '../../components/map/MapView';
import useNeedsStore from '../../stores/needsStore';
import { URGENCY_CONFIG, ZONES } from '../../config/constants';
import Card from '../../components/ui/Card';

const MapPage = () => {
  const { needs } = useNeedsStore();
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');

  const filtered = needs.filter(n => {
    if (urgencyFilter !== 'all' && n.urgencyLabel !== urgencyFilter) return false;
    if (zoneFilter !== 'all' && n.zone !== zoneFilter) return false;
    return true;
  });

  const withLocation = filtered.filter(n => n.location?.lat && n.location?.lng);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8" 
      id="map-page"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Geospatial Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time visualization of community requirements and resource distribution.</p>
        </div>
        <div className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <Select 
            value={urgencyFilter} 
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold h-11"
            options={[{ value: 'all', label: 'All Urgency' }, ...Object.keys(URGENCY_CONFIG).map(k => ({ value: k, label: URGENCY_CONFIG[k].label }))]} 
          />
          <Select 
            value={zoneFilter} 
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold h-11"
            options={[{ value: 'all', label: 'All Zones' }, ...ZONES.map(z => ({ value: z, label: z }))]} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card padding="p-2" className="overflow-hidden border-slate-200 shadow-xl relative group h-[calc(100vh-18rem)] min-h-[500px]">
            <MapView needs={filtered} className="h-full w-full rounded-2xl" />
            
            {/* Map Overlay Stats */}
            <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
               <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Visible Needs</span>
                     <span className="text-2xl font-black">{withLocation.length}</span>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Coverage</span>
                     <span className="text-2xl font-black">94%</span>
                  </div>
               </div>
            </div>
          </Card>
        </div>

        {/* Legend & Info */}
        <div className="space-y-6">
           <Card className="bg-white border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                 Map Legend
              </h3>
              <div className="space-y-4">
                {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: cfg.hex }} />
                      <span className="text-xs font-bold text-slate-600">{cfg.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase">{key === 'critical' ? 'Urgent' : 'Normal'}</span>
                  </div>
                ))}
              </div>
           </Card>

           <Card className="bg-white border-slate-200 shadow-sm p-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                 <Info className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="text-lg font-black mb-3 text-slate-900">Live Feed Integration</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                 Markers update automatically as new needs are reported and validated by AI. Click on a marker to view full details and convert to a task.
              </p>
           </Card>

           <div className="p-6 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                 <MapIcon className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                 Use the filters above to isolate specific zones or urgency levels.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MapPage;
