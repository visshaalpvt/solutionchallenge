export const ZONES = [
  'North Zone',
  'South Zone',
  'East Zone',
  'West Zone',
  'Central Zone',
  'Northeast Zone',
  'Northwest Zone',
  'Southeast Zone',
  'Southwest Zone',
  'South Asia (Global)',
];

export const ZONE_COORDINATES = {
  'North Zone': { lat: 28.6139, lng: 77.2090 },
  'South Zone': { lat: 13.0827, lng: 80.2707 },
  'East Zone': { lat: 22.5726, lng: 88.3639 },
  'West Zone': { lat: 19.0760, lng: 72.8777 },
  'Central Zone': { lat: 23.2599, lng: 77.4126 },
  'Northeast Zone': { lat: 26.1445, lng: 91.7362 },
  'Northwest Zone': { lat: 31.1048, lng: 77.1734 },
  'Southeast Zone': { lat: 17.3850, lng: 78.4867 },
  'Southwest Zone': { lat: 12.9716, lng: 77.5946 },
  'South Asia (Global)': { lat: 20.5937, lng: 78.9629 },
};

export const SKILLS = [
  'Medical & First Aid',
  'Teaching & Tutoring',
  'Construction & Repair',
  'Food & Nutrition',
  'Counseling & Mental Health',
  'Transportation & Logistics',
  'IT & Technology',
  'Environmental & Cleanup',
  'Child Care',
  'Elder Care',
  'Legal Aid',
  'Event Management',
  'Communication & Media',
  'Sports & Recreation',
  'Agriculture & Farming',
];

export const CATEGORIES = [
  'Healthcare',
  'Education',
  'Infrastructure',
  'Food & Water',
  'Shelter & Housing',
  'Safety & Security',
  'Environment',
  'Livelihood',
  'Social Services',
  'Disaster Relief',
];

export const AVAILABILITY = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const URGENCY_CONFIG = {
  critical: {
    label: 'Critical',
    color: 'text-urgency-critical',
    bg: 'bg-urgency-critical-bg',
    border: 'border-urgency-critical/30',
    dot: 'bg-urgency-critical',
    hex: '#f43f5e',
  },
  high: {
    label: 'High',
    color: 'text-urgency-high',
    bg: 'bg-urgency-high-bg',
    border: 'border-urgency-high/30',
    dot: 'bg-urgency-high',
    hex: '#f97316',
  },
  medium: {
    label: 'Medium',
    color: 'text-urgency-medium',
    bg: 'bg-urgency-medium-bg',
    border: 'border-urgency-medium/30',
    dot: 'bg-urgency-medium',
    hex: '#eab308',
  },
  low: {
    label: 'Low',
    color: 'text-urgency-low',
    bg: 'bg-urgency-low-bg',
    border: 'border-urgency-low/30',
    dot: 'bg-urgency-low',
    hex: '#22c55e',
  },
};

export const NEED_STATUS = ['open', 'in_progress', 'resolved'];
export const TASK_STATUS = ['open', 'assigned', 'completed'];
