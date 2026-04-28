import { create } from 'zustand';
import { subscribeToVolunteers } from '../services/firestoreService';

const useVolunteersStore = create((set, get) => ({
  volunteers: [],
  loading: true,

  setVolunteers: (volunteers) => set({ volunteers, loading: false }),
  setLoading: (loading) => set({ loading }),

  getVolunteerById: (uid) => {
    return get().volunteers.find((v) => v.uid === uid);
  },

  getVolunteersByZone: (zone) => {
    return get().volunteers.filter((v) => v.zone === zone);
  },

  getVolunteersBySkill: (skill) => {
    return get().volunteers.filter((v) => v.skills?.includes(skill));
  },

  getActiveVolunteers: () => {
    return get().volunteers.filter((v) => (v.tasksActive || 0) > 0);
  },

  getStats: () => {
    const volunteers = get().volunteers;
    return {
      total: volunteers.length,
      active: volunteers.filter((v) => (v.tasksActive || 0) > 0).length,
      available: volunteers.filter(
        (v) => (v.availability || []).length > 0
      ).length,
    };
  },

  initSubscription: () => {
    return subscribeToVolunteers((volunteers) => {
      set({ volunteers, loading: false });
    });
  },
}));

export default useVolunteersStore;
