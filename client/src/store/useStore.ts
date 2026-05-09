import { create } from 'zustand';
import { User, Review, AgentLog } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Reviews
  reviews: Review[];
  currentReview: Review | null;
  
  // Agent streaming
  agentLogs: AgentLog[];

  // UI
  sidebarOpen: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setReviews: (reviews: Review[]) => void;
  setCurrentReview: (review: Review | null) => void;
  updateCurrentReview: (updates: Partial<Review>) => void;
  addAgentLog: (log: AgentLog) => void;
  clearAgentLogs: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('devaudit_token') : null,
  isAuthenticated: false,
  reviews: [],
  currentReview: null,
  agentLogs: [],
  sidebarOpen: true,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('devaudit_token', token);
      } else {
        localStorage.removeItem('devaudit_token');
      }
    }
    set({ token, isAuthenticated: !!token });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devaudit_token');
    }
    set({ user: null, token: null, isAuthenticated: false, reviews: [], currentReview: null, agentLogs: [] });
  },

  setReviews: (reviews) => set({ reviews }),
  
  setCurrentReview: (review) => set({ currentReview: review }),
  
  updateCurrentReview: (updates) => {
    const current = get().currentReview;
    if (current) {
      set({ currentReview: { ...current, ...updates } });
    }
  },

  addAgentLog: (log) => set((state) => ({
    agentLogs: [...state.agentLogs, log]
  })),

  clearAgentLogs: () => set({ agentLogs: [] }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
