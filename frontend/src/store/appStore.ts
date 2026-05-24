import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  currentBranch: string | null;
  theme: 'light' | 'dark' | 'system';
  notifications: number;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentBranch: (branchId: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotifications: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  currentBranch: null,
  theme: 'system',
  notifications: 0,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentBranch: (branchId) => set({ currentBranch: branchId }),
  setTheme: (theme) => set({ theme }),
  setNotifications: (count) => set({ notifications: count }),
}));
