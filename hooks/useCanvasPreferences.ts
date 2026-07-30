import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CanvasPreferencesState {
  // Modal state
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  // Preferences
  showGrid: boolean;
  enableShadows: boolean;
  performanceMode: "quality" | "performance";
  cameraInvertY: boolean;
  autoSaveInterval: number;
  geminiModel: string;

  // Actions
  setShowGrid: (show: boolean) => void;
  setEnableShadows: (enable: boolean) => void;
  setPerformanceMode: (mode: "quality" | "performance") => void;
  setCameraInvertY: (invert: boolean) => void;
  setAutoSaveInterval: (seconds: number) => void;
  setGeminiModel: (model: string) => void;
}

export const useCanvasPreferences = create<CanvasPreferencesState>()(
  persist(
    (set) => ({
      isSettingsOpen: false,
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),

      showGrid: true,
      enableShadows: true,
      performanceMode: "quality",
      cameraInvertY: false,
      autoSaveInterval: 30,
      geminiModel: "gemini-2.5-pro",

      setShowGrid: (show) => set({ showGrid: show }),
      setEnableShadows: (enable) => set({ enableShadows: enable }),
      setPerformanceMode: (mode) => set({ performanceMode: mode }),
      setCameraInvertY: (invert) => set({ cameraInvertY: invert }),
      setAutoSaveInterval: (seconds) => set({ autoSaveInterval: seconds }),
      setGeminiModel: (model) => set({ geminiModel: model }),
    }),
    {
      name: "ghost-ai-canvas-preferences",
      // Do not persist the open state of the modal
      partialize: (state) => ({
        showGrid: state.showGrid,
        enableShadows: state.enableShadows,
        performanceMode: state.performanceMode,
        cameraInvertY: state.cameraInvertY,
        autoSaveInterval: state.autoSaveInterval,
        geminiModel: state.geminiModel,
      }),
    }
  )
);
