import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiRequest } from '../types';
import { nanoid } from 'nanoid';

export interface TabRequest extends ApiRequest {
  isDirty?: boolean;
}

interface WorkspaceState {
  openRequests: TabRequest[];
  activeRequestId: string | null;
  addRequest: (request: Partial<TabRequest>) => void;
  removeRequest: (id: string) => void;
  updateRequest: (id: string, updates: Partial<TabRequest>) => void;
  setActiveRequest: (id: string) => void;
  setOpenRequests: (requests: TabRequest[]) => void;
  clearRequests: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      openRequests: [],
      activeRequestId: null,

      addRequest: (request) =>
        set((state) => {
          const id = request._id || nanoid();
          const existing = state.openRequests.find((r) => r._id === id);
          if (existing) {
            return { activeRequestId: existing._id };
          }
          const newRequest = { ...request, _id: id } as TabRequest;
          return {
            openRequests: [...state.openRequests, newRequest],
            activeRequestId: id,
          };
        }),

      removeRequest: (id) =>
        set((state) => {
          const newRequests = state.openRequests.filter((r) => r._id !== id);
          let newActiveId = state.activeRequestId;
          if (newActiveId === id) {
            newActiveId = newRequests.length > 0 ? newRequests[newRequests.length - 1]._id : null;
          }
          return {
            openRequests: newRequests,
            activeRequestId: newActiveId,
          };
        }),

      updateRequest: (id, updates) =>
        set((state) => ({
          openRequests: state.openRequests.map((r) =>
            r._id === id ? { ...r, ...updates, isDirty: true } : r
          ),
        })),

      setActiveRequest: (id) => set({ activeRequestId: id }),
      setOpenRequests: (openRequests) => set({ openRequests }),
      clearRequests: () => set({ openRequests: [], activeRequestId: null }),
    }),
    {
      name: 'flux-workspace-storage',
    }
  )
);
