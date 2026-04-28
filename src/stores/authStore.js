import { create } from 'zustand';
import { onAuthChange } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),

  initAuth: () => {
    // Safety timeout — if auth doesn't resolve in 5 seconds, stop loading
    const timeout = setTimeout(() => {
      const state = get();
      if (state.loading) {
        console.warn('Auth timeout — forcing load complete');
        set({ loading: false });
      }
    }, 5000);

    try {
      const unsubscribe = onAuthChange((user) => {
        clearTimeout(timeout);
        set({ user, loading: false });
      });
      return () => {
        clearTimeout(timeout);
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } catch (error) {
      clearTimeout(timeout);
      console.error('Auth init error:', error);
      set({ user: null, loading: false, error: error.message });
      return () => {};
    }
  },

  isAdmin: () => get().user?.role === 'admin',
  isVolunteer: () => get().user?.role === 'volunteer',
}));

export default useAuthStore;
