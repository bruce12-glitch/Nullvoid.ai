import { create } from "zustand";

interface PerformanceState {
  dpr: number;
  quality: "high" | "medium" | "low";
  fps: number;
  setPerformanceMetrics: (dpr: number, quality: "high" | "medium" | "low", fps: number) => void;
}

export const usePerformanceAdaptive = create<PerformanceState>((set) => ({
  dpr: 2,
  quality: "high",
  fps: 60,
  setPerformanceMetrics: (dpr, quality, fps) => set({ dpr, quality, fps }),
}));
