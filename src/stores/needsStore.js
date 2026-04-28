import { create } from 'zustand';
import { subscribeToNeeds } from '../services/firestoreService';

const useNeedsStore = create((set, get) => ({
  needs: [],
  loading: true,
  filters: {
    urgency: 'all',
    category: 'all',
    status: 'all',
    search: '',
  },

  setNeeds: (needs) => set({ needs, loading: false }),
  setLoading: (loading) => set({ loading }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () =>
    set({
      filters: { urgency: 'all', category: 'all', status: 'all', search: '' },
    }),

  getFilteredNeeds: () => {
    const { needs, filters } = get();
    return needs.filter((need) => {
      if (filters.urgency !== 'all' && need.urgencyLabel !== filters.urgency) return false;
      if (filters.category !== 'all' && need.category !== filters.category) return false;
      if (filters.status !== 'all' && need.status !== filters.status) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          need.title?.toLowerCase().includes(search) ||
          need.description?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  },

  getStats: () => {
    const needs = get().needs;
    return {
      total: needs.length,
      critical: needs.filter((n) => n.urgencyLabel === 'critical').length,
      high: needs.filter((n) => n.urgencyLabel === 'high').length,
      medium: needs.filter((n) => n.urgencyLabel === 'medium').length,
      low: needs.filter((n) => n.urgencyLabel === 'low').length,
      open: needs.filter((n) => n.status === 'open').length,
      inProgress: needs.filter((n) => n.status === 'in_progress').length,
      resolved: needs.filter((n) => n.status === 'resolved').length,
    };
  },

  initSubscription: () => {
    return subscribeToNeeds((needs) => {
      set({ needs, loading: false });
    });
  },
}));

export default useNeedsStore;
