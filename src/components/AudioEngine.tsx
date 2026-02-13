import { useEffect, useRef, useCallback } from 'react';
import { useRadioStore } from '@/stores/useRadioStore';
import Hls from 'hls.js';
import { isYouTubeUrl, extractYouTubeId } from '@/lib/youtube';

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

// YouTube IFrame API types
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  destroy: () => void;
}

interface YTPlayerConstructor {
  new (elementId: string, options: Record<string, unknown>): YTPlayer;
}

declare global {
  interface Window {
    YT?: { Player: YTPlayerConstructor; PlayerState: Record<string, number> };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiLoaded = false;
let ytApiLoading = false;
const ytReadyCallbacks: (() => void)[] = [];

function loadYouTubeApi(): Promise<void> {
  if (ytApiLoaded && window.YT) return Promise.resolve();
  return new Promise((resolve) => {
    ytReadyCallbacks.push(resolve);
    if (ytApiLoading) return;
    ytApiLoading = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true;
      ytReadyCallbacks.forEach((cb) => cb());
      ytReadyCallbacks.length = 0;
    };
  });
}

/**
 * AudioEngine — persistent component mounted at App root.
 * Supports HLS streams (.m3u8) and YouTube URLs.
 * Audio element is rendered in the DOM for background playback support.
 */
const AudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const isPlayingRef = useRef(false);
  const activeSourceType = useRef<'hls' | 'youtube' | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const {
    isPlaying, volume, getCurrentStreamUrl, getCurrentEnvironment,
    currentEnvironmentSlug, currentTrack, setPlaying,
    loadEnvironments, environmentsLoaded, loadLiveStatus,
    environments, setBuffering, setStreamError,
  } = useRadioStore();

  // Keep ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Wake Lock — prevents screen/device sleep while playing
  useEffect(() => {
    const requestWakeLock = async () => {
      if (!('wakeLock' in navigator)) return;
      try {
        if (isPlaying && !wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null;
          });
        } else if (!isPlaying && wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      } catch {
        // Wake Lock can fail silently
      }
    };
    requestWakeLock();

    // Re-acquire wake lock when page becomes visible again
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlayingRef.current) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isPlaying]);

  // Load environments + live status on mount
  useEffect(() => {
    if (!environmentsLoaded) loadEnvironments();
    loadLiveStatus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
      ytPlayerRef.current?.destroy();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      wakeLockRef.current?.release();
    };
  }, []);

  // Cleanup helpers
  const cleanupHls = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
  }, []);

  const cleanupYt = useCallback(() => {
    ytPlayerRef.current?.destroy();
    ytPlayerRef.current = null;
  }, []);

  // Source management — react to stream URL changes
  const streamUrl = getCurrentStreamUrl();

  useEffect(() => {
    if (!streamUrl) return;

    // Cleanup previous source
    cleanupHls();
    cleanupYt();
    setBuffering(true);
    setStreamError(null);

    if (isYouTubeUrl(streamUrl)) {
      activeSourceType.current = 'youtube';
      const videoId = extractYouTubeId(streamUrl);
      if (!videoId) {
        setStreamError('Link do YouTube inválido');
        setBuffering(false);
        return;
      }

      loadYouTubeApi().then(() => {
        if (!window.YT) return;
        if (!ytContainerRef.current) return;

        const div = document.createElement('div');
        div.id = 'yt-audio-player';
        ytContainerRef.current.innerHTML = '';
        ytContainerRef.current.appendChild(div);

        const player = new window.YT.Player('yt-audio-player', {
          videoId,
          height: '1',
          width: '1',
          playerVars: {
            autoplay: isPlayingRef.current ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: () => {
              setBuffering(false);
              player.setVolume(useRadioStore.getState().volume * 100);
              if (isPlayingRef.current) player.playVideo();
            },
            onStateChange: (event: { data: number }) => {
              if (event.data === 3) setBuffering(true);
              if (event.data === 1) { setBuffering(false); setStreamError(null); }
              if (event.data === -1 || event.data === 5) setBuffering(false);
            },
            onError: () => {
              setStreamError('Erro ao reproduzir YouTube');
              setBuffering(false);
              setTimeout(() => setStreamError(null), 4000);
            },
          },
        } as Record<string, unknown>);

        ytPlayerRef.current = player;
      });

      return () => {
        cleanupYt();
      };
    }

    // HLS path
    activeSourceType.current = 'hls';
    const audio = audioRef.current;
    if (!audio) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        // Keep loading in background to prevent stalls
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setBuffering(false);
        if (isPlayingRef.current) audio.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setStreamError('Erro de conexão. Reconectando...');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setStreamError('Erro de mídia. Recuperando...');
            hls.recoverMediaError();
          } else {
            setStreamError('Stream indisponível');
          }
          setTimeout(() => setStreamError(null), 4000);
        }
      });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      audio.src = streamUrl;
      setBuffering(false);
      if (isPlayingRef.current) audio.play().catch(() => {});
    }

    const onWaiting = () => setBuffering(true);
    const onPlaying = () => { setBuffering(false); setStreamError(null); };
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);

    return () => {
      cleanupHls();
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
    };
  }, [streamUrl]);

  // Play/pause sync
  useEffect(() => {
    if (!streamUrl) return;

    if (activeSourceType.current === 'youtube' && ytPlayerRef.current) {
      if (isPlaying) ytPlayerRef.current.playVideo();
      else ytPlayerRef.current.pauseVideo();
    } else if (activeSourceType.current === 'hls' && audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying, streamUrl]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (ytPlayerRef.current) ytPlayerRef.current.setVolume(volume * 100);
  }, [volume]);

  // Re-resume playback when page becomes visible (handles mobile browser throttling)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlayingRef.current) {
        if (activeSourceType.current === 'hls' && audioRef.current) {
          // Check if audio was paused by the browser
          if (audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        } else if (activeSourceType.current === 'youtube' && ytPlayerRef.current) {
          ytPlayerRef.current.playVideo();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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

    navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));

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

  return (
    <>
      {/* Audio element IN the DOM for proper background playback on mobile */}
      <audio
        ref={audioRef}
        playsInline
        preload="none"
        style={{ position: 'fixed', top: -9999, left: -9999, width: 0, height: 0 }}
      />
      {/* Hidden container for YouTube iframe */}
      <div
        ref={ytContainerRef}
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, overflow: 'hidden' }}
      />
    </>
  );
};

export default AudioEngine;
