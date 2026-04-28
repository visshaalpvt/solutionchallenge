import { create } from 'zustand';
import { subscribeToTasks } from '../services/firestoreService';

const useTasksStore = create((set, get) => ({
  tasks: [],
  loading: true,
  filters: {
    status: 'all',
    zone: 'all',
    search: '',
  },

  setTasks: (tasks) => set({ tasks, loading: false }),
  setLoading: (loading) => set({ loading }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () =>
    set({
      filters: { status: 'all', zone: 'all', search: '' },
    }),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.zone !== 'all' && task.zone !== filters.zone) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          task.title?.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  },

  getStats: () => {
    const tasks = get().tasks;
    return {
      total: tasks.length,
      open: tasks.filter((t) => t.status === 'open').length,
      assigned: tasks.filter((t) => t.status === 'assigned').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  },

  getTasksByVolunteer: (uid) => {
    return get().tasks.filter((t) => t.assignedTo === uid);
  },

  getOpenTasks: () => {
    return get().tasks.filter((t) => t.status === 'open');
  },

  initSubscription: () => {
    return subscribeToTasks((tasks) => {
      set({ tasks, loading: false });
    });
  },
}));

export default useTasksStore;
