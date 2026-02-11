import { create } from 'zustand';

export type Environment = 'sertanejo' | 'poprock' | 'raiz' | 'gospel';

export interface Sponsor {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  displayTime: number;
  active: boolean;
}

export interface RadioState {
  isPlaying: boolean;
  volume: number;
  currentEnvironment: Environment;
  isLive: boolean;
  currentTrack: {
    title: string;
    artist: string;
    album: string;
  };
  sponsors: Sponsor[];
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setEnvironment: (env: Environment) => void;
  togglePlay: () => void;
}

export const useRadioStore = create<RadioState>((set) => ({
  isPlaying: false,
  volume: 0.8,
  currentEnvironment: 'sertanejo',
  isLive: true,
  currentTrack: {
    title: 'Rádio TVG ao Vivo',
    artist: 'Transmissão Contínua',
    album: 'Rádio TVG',
  },
  sponsors: [
    { id: '1', name: 'Sponsor Alpha', imageUrl: '', linkUrl: '#', displayTime: 5, active: true },
    { id: '2', name: 'Sponsor Beta', imageUrl: '', linkUrl: '#', displayTime: 5, active: true },
    { id: '3', name: 'Sponsor Gamma', imageUrl: '', linkUrl: '#', displayTime: 5, active: true },
  ],
  setPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
  setEnvironment: (env) => set({ currentEnvironment: env }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
}));

export const environmentMeta: Record<Environment, { label: string; colorVar: string; description: string }> = {
  sertanejo: { label: 'Sertanejo', colorVar: '--env-sertanejo', description: 'O melhor do sertanejo' },
  poprock: { label: 'Pop/Rock', colorVar: '--env-poprock', description: 'Hits e clássicos' },
  raiz: { label: 'Raiz', colorVar: '--env-raiz', description: 'Música de raiz brasileira' },
  gospel: { label: 'Gospel', colorVar: '--env-gospel', description: 'Louvor e adoração' },
};
