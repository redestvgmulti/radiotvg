import { create } from 'zustand';
import { defaultStreamId } from '@/data/streams';

export type RadioMode = 'MUSIC_ONLY' | 'PROGRAM_LIVE' | 'COMMERCIAL_BREAK';

export type RadioStatus = {
  mode: RadioMode;
  programName?: string;
  videoUrl?: string;
  startedAt?: string;
};

interface RadioState {
  mode: RadioMode;
  programName: string;
  startedAt: string;
  videoUrl?: string;
  streamId: string;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  setStream: (streamId: string) => void;
  setStatus: (status: RadioStatus) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  isStyleSelectorOpen: boolean;
  setStyleSelectorOpen: (isOpen: boolean) => void;
  toggleStyleSelector: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const useRadioStore = create<RadioState>((set) => ({
  mode: 'MUSIC_ONLY',
  programName: 'Flow Sessions',
  startedAt: new Date().toISOString(),
  videoUrl: undefined,
  streamId: defaultStreamId,
  isPlaying: false,
  volume: 0.65,
  muted: false,
  isSidebarOpen: false,
  setStream: (streamId) => set({ streamId }),
  setStatus: (status) =>
    set((state) => ({
      ...state,
      mode: status.mode,
      programName: status.programName ?? state.programName,
      startedAt: status.startedAt ?? state.startedAt,
      videoUrl: status.videoUrl ?? state.videoUrl
    })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ muted }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isStyleSelectorOpen: false,
  setStyleSelectorOpen: (isOpen) => set({ isStyleSelectorOpen: isOpen }),
  toggleStyleSelector: () => set((state) => ({ isStyleSelectorOpen: !state.isStyleSelectorOpen })),
  activeView: 'Rádio',
  setActiveView: (view: string) => set({ activeView: view })
}));
