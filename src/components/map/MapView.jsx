import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { URGENCY_CONFIG } from '../../config/constants';
import Badge, { StatusBadge } from '../ui/Badge';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createUrgencyIcon = (urgencyLabel) => {
  const color = URGENCY_CONFIG[urgencyLabel]?.hex || '#6366f1';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 16px ${color}40; border: 3px solid white;
    "><div style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: 900;">!</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const MapView = ({ needs = [], tasks = [], showTasks = false, className = '' }) => {
  const defaultCenter = [20.5937, 78.9629]; // India center
  const items = needs.filter(n => n.location?.lat && n.location?.lng);

  return (
    <div className={`rounded-3xl overflow-hidden border border-slate-200 shadow-xl ${className}`} id="map-container">
      <MapContainer
        center={items.length > 0 ? [items[0].location.lat, items[0].location.lng] : defaultCenter}
        zoom={items.length > 0 ? 10 : 5}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map(need => (
          <Marker key={need.id} position={[need.location.lat, need.location.lng]} icon={createUrgencyIcon(need.urgencyLabel)}>
            <Popup className="premium-popup">
              <div className="min-w-[220px] p-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge urgency={need.urgencyLabel} />
                  <StatusBadge status={need.status} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1 leading-tight">{need.title}</h3>
                <p className="text-[11px] font-medium text-slate-500 mb-4 leading-relaxed line-clamp-3">
                  {need.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone</span>
                    <span className="text-[11px] font-bold text-slate-700">{need.zone}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Urgency</span>
                    <span className="text-[11px] font-black text-indigo-600">{need.urgencyScore}/10</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        .premium-popup .leaflet-popup-content-wrapper {
          border-radius: 1.5rem;
          padding: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .premium-popup .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MapView;
