import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface StreamEnvironment {
  id: string;
  slug: string;
  label: string;
  description: string;
  stream_url: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface RadioState {
  isPlaying: boolean;
  volume: number;
  currentEnvironmentSlug: string;
  isLive: boolean;
  isBuffering: boolean;
  streamError: string | null;
  environments: StreamEnvironment[];
  environmentsLoaded: boolean;
  currentTrack: {
    title: string;
    artist: string;
    album: string;
  };
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setEnvironment: (slug: string) => void;
  setBuffering: (buffering: boolean) => void;
  setStreamError: (error: string | null) => void;
  togglePlay: () => void;
  loadEnvironments: () => Promise<void>;
  loadLiveStatus: () => Promise<void>;
  getCurrentEnvironment: () => StreamEnvironment | undefined;
  getCurrentStreamUrl: () => string;
}

export const useRadioStore = create<RadioState>((set, get) => ({
  isPlaying: false,
  volume: 0.8,
  currentEnvironmentSlug: '',
  isLive: false,
  isBuffering: false,
  streamError: null,
  environments: [],
  environmentsLoaded: false,
  currentTrack: {
    title: 'Rádio TVG ao Vivo',
    artist: 'Transmissão Contínua',
    album: 'Rádio TVG',
  },
  setPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
  setEnvironment: (slug) => {
    const env = get().environments.find(e => e.slug === slug);
    set({
      currentEnvironmentSlug: slug,
      currentTrack: {
        title: env?.label || 'Rádio TVG ao Vivo',
        artist: env?.description || 'Transmissão Contínua',
        album: 'Rádio TVG',
      },
    });
  },
  setBuffering: (buffering) => set({ isBuffering: buffering }),
  setStreamError: (error) => set({ streamError: error }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  loadEnvironments: async () => {
    const { data } = await supabase
      .from('stream_environments')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    const envs = data || [];
    const current = get().currentEnvironmentSlug;
    const firstSlug = envs[0]?.slug || '';
    set({
      environments: envs,
      environmentsLoaded: true,
      currentEnvironmentSlug: current && envs.find(e => e.slug === current) ? current : firstSlug,
      currentTrack: {
        title: envs[0]?.label || 'Rádio TVG ao Vivo',
        artist: envs[0]?.description || 'Transmissão Contínua',
        album: 'Rádio TVG',
      },
    });
  },
  loadLiveStatus: async () => {
    const { data } = await supabase
      .from('radio_settings')
      .select('value')
      .eq('key', 'is_live')
      .maybeSingle();
    set({ isLive: data?.value === 'true' });

    supabase
      .channel('live-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'radio_settings', filter: 'key=eq.is_live' },
        (payload) => {
          const newVal = (payload.new as { value?: string })?.value;
          set({ isLive: newVal === 'true' });
        }
      )
      .subscribe();
  },
  getCurrentEnvironment: () => {
    const state = get();
    return state.environments.find(e => e.slug === state.currentEnvironmentSlug);
  },
  getCurrentStreamUrl: () => {
    const env = get().getCurrentEnvironment();
    return env?.stream_url || '';
  },
}));

// Legacy compat — color mapping by slug
const envColorMap: Record<string, string> = {
  aovivo: '--env-sertanejo',
  sertanejo: '--env-sertanejo',
  poprock: '--env-poprock',
  raiz: '--env-raiz',
  gospel: '--env-gospel',
  };

export const getEnvColorVar = (slug: string): string => {
  return envColorMap[slug] || '--env-sertanejo';
};
