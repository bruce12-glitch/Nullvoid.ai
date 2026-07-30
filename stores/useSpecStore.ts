import { create } from "zustand";

export interface SpecData {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

interface SpecStore {
  currentSpec: SpecData | null;
  isSidebarOpen: boolean;
  activeTab: string;
  highlightedNodeId: string | null;
  
  setSpec: (spec: SpecData | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  setHighlightedNodeId: (id: string | null) => void;
}

export const useSpecStore = create<SpecStore>((set) => ({
  currentSpec: null,
  isSidebarOpen: false,
  activeTab: "overview",
  highlightedNodeId: null,

  setSpec: (spec) => set({ currentSpec: spec }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setHighlightedNodeId: (id) => set({ highlightedNodeId: id }),
}));
