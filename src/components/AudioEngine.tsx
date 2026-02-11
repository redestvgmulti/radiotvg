import { useEffect, useRef } from 'react';
import { useRadioStore } from '@/stores/useRadioStore';
import Hls from 'hls.js';

import envSertanejo from '@/assets/env-sertanejo.jpg';
import envPoprock from '@/assets/env-poprock.jpg';
import envRaiz from '@/assets/env-raiz.jpg';
import envGospel from '@/assets/env-gospel.jpg';

const localImageMap: Record<string, string> = {
  sertanejo: envSertanejo,
  poprock: envPoprock,
  raiz: envRaiz,
  gospel: envGospel,
};

/**
 * AudioEngine — persistent component mounted at App root.
 * Owns the <audio> element and HLS instance.
 * Never unmounts during navigation.
 */
const AudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isPlayingRef = useRef(false);

  const {
    isPlaying, volume, getCurrentStreamUrl, getCurrentEnvironment,
    currentEnvironmentSlug, currentTrack, setPlaying,
    loadEnvironments, environmentsLoaded, loadLiveStatus,
    environments,
  } = useRadioStore();

  // Keep ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Load environments + live status on mount
  useEffect(() => {
    if (!environmentsLoaded) loadEnvironments();
    loadLiveStatus();
  }, []);

  // Create audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return () => {
      hlsRef.current?.destroy();
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // HLS source management — react to stream URL changes
  const streamUrl = getCurrentStreamUrl();
  useEffect(() => {
    if (!streamUrl || !audioRef.current) return;
    const audio = audioRef.current;

    // Cleanup previous HLS
    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlayingRef.current) audio.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        }
      });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = streamUrl;
      if (isPlayingRef.current) audio.play().catch(() => {});
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [streamUrl]);

  // Play/pause sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, streamUrl]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Media Session API
  const env = getCurrentEnvironment();
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const artworkUrl = env?.image_url || localImageMap[env?.slug || 'sertanejo'] || localImageMap.sertanejo;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
      artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      setPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      setPlaying(false);
    });

    // Next/prev environment
    const { environments: envs, currentEnvironmentSlug, setEnvironment } = useRadioStore.getState();
    const currentIdx = envs.findIndex(e => e.slug === currentEnvironmentSlug);

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      const state = useRadioStore.getState();
      const idx = state.environments.findIndex(e => e.slug === state.currentEnvironmentSlug);
      if (idx < state.environments.length - 1) {
        state.setEnvironment(state.environments[idx + 1].slug);
      }
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      const state = useRadioStore.getState();
      const idx = state.environments.findIndex(e => e.slug === state.currentEnvironmentSlug);
      if (idx > 0) {
        state.setEnvironment(state.environments[idx - 1].slug);
      }
    });
  }, [currentTrack, env, currentEnvironmentSlug, setPlaying]);

  // Renders nothing — audio engine is invisible
  return null;
};

export default AudioEngine;
