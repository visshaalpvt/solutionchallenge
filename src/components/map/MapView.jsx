import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { URGENCY_CONFIG, ZONE_COORDINATES } from '../../config/constants';
import Badge, { StatusBadge } from '../ui/Badge';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createPremiumIcon = (urgencyLabel, isTask = false, status = 'open') => {
  const color = URGENCY_CONFIG[urgencyLabel]?.hex || '#6366f1';
  const isPulsing = status === 'in_progress' || status === 'assigned';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-wrapper">
        ${isPulsing ? `<div class="pulse" style="background: ${color}40"></div>` : ''}
        <div class="marker-pin" style="background: ${color}; border: 2px solid white; box-shadow: 0 4px 10px ${color}60;">
          <div class="marker-inner">
            ${isTask ? '⚡' : '!'}
          </div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const MapView = ({ needs = [], tasks = [], className = '' }) => {
  const defaultCenter = [20.5937, 78.9629]; // India center

  // Prepare all items to show on map
  const needMarkers = needs.map(n => ({
    ...n,
    type: 'need',
    coords: n.location?.lat ? [n.location.lat, n.location.lng] : 
            (ZONE_COORDINATES[n.zone] ? [ZONE_COORDINATES[n.zone].lat, ZONE_COORDINATES[n.zone].lng] : defaultCenter)
  }));

  const taskMarkers = tasks.filter(t => t.status !== 'completed').map(t => ({
    ...t,
    type: 'task',
    coords: t.location?.lat ? [t.location.lat, t.location.lng] : 
            (ZONE_COORDINATES[t.zone] ? [ZONE_COORDINATES[t.zone].lat + 0.01, ZONE_COORDINATES[t.zone].lng + 0.01] : [defaultCenter[0] + 0.01, defaultCenter[1] + 0.01])
  }));

  const allMarkers = [...needMarkers, ...taskMarkers];

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl ${className}`} id="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%', minHeight: '600px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {allMarkers.map(item => (
          <Marker 
            key={`${item.type}-${item.id}`} 
            position={item.coords} 
            icon={createPremiumIcon(item.urgencyLabel || 'medium', item.type === 'task', item.status)}
          >
            <Popup className="premium-popup">
              <div className="min-w-[240px] p-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.type === 'task' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {item.type}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1 leading-tight">{item.title}</h3>
                <p className="text-[11px] font-medium text-slate-500 mb-4 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Region</span>
                    <span className="text-[10px] font-bold text-slate-700">{item.zone}</span>
                  </div>
                  {item.urgencyScore && (
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                      <span className="text-[10px] font-black text-indigo-600">{item.urgencyScore}/10</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Info Card */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20">
         <div className="flex items-center gap-4">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase">Live Ops</span>
               <span className="text-lg font-black text-slate-900">{tasks.filter(t => t.status === 'assigned').length} Active</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase">Unmet Needs</span>
               <span className="text-lg font-black text-indigo-600">{needs.filter(n => n.status === 'open').length} Total</span>
            </div>
         </div>
      </div>

      <style>{`
        .marker-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .marker-inner {
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: 900;
        }
        .pulse {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          animation: map-pulse 2s infinite;
          z-index: 1;
        }
        @keyframes map-pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .premium-popup .leaflet-popup-content-wrapper {
          border-radius: 1.5rem;
          padding: 0.5rem;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .premium-popup .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MapView;
