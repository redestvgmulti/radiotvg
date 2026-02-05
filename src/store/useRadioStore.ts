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
}

export const useRadioStore = create<RadioState>((set) => ({
  mode: 'MUSIC_ONLY',
  programName: 'Ambient Sessions',
  startedAt: new Date().toISOString(),
  videoUrl: undefined,
  streamId: defaultStreamId,
  isPlaying: false,
  volume: 0.65,
  muted: false,
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
  setMuted: (muted) => set({ muted })
}));
