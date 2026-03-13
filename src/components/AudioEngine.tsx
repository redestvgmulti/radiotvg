import { useEffect, useRef, useCallback } from 'react';
import { useRadioStore } from '@/stores/useRadioStore';
import Hls from 'hls.js';
import { isYouTubeUrl, extractYouTubeId } from '@/lib/youtube';
import { useStreamMetadata } from '@/hooks/useStreamMetadata';

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

// Diagnostic logger for background playback validation
const logAudioState = (event: string, detail?: string) => {
  console.log(`[AUDIO STATE] ${event}${detail ? ` — ${detail}` : ''} | ${new Date().toLocaleTimeString()}`);
};

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
  const hlsRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInitiatedPauseRef = useRef(false);
  const isRetryingRef = useRef(false);

  const {
    isPlaying, volume, getCurrentStreamUrl, getCurrentEnvironment,
    currentEnvironmentSlug, currentTrack, setPlaying,
    loadEnvironments, environmentsLoaded, loadLiveStatus,
    environments, setBuffering, setStreamError,
  } = useRadioStore();

  // Poll ICY metadata from SHOUTcast/Icecast stream
  useStreamMetadata();

  // Keep ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // MediaSession playbackState sync
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      logAudioState('playbackState', isPlaying ? 'playing' : 'paused');
    }
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

  // Load environments + live status on mount, then autoplay
  const autoplayAttemptedRef = useRef(false);

  useEffect(() => {
    if (!environmentsLoaded) {
      loadEnvironments().then(() => {
        const url = useRadioStore.getState().getCurrentStreamUrl();
        if (url) {
          setPlaying(true);
          // Try immediate autoplay; if blocked, wait for first user interaction
          const tryAutoplay = () => {
            const audio = audioRef.current;
            if (!audio || autoplayAttemptedRef.current) return;
            autoplayAttemptedRef.current = true;
            
            const playPromise = audio.play();
            if (playPromise) {
              playPromise.catch(() => {
                logAudioState('Autoplay blocked', 'waiting for first user interaction');
                const onFirstInteraction = () => {
                  document.removeEventListener('click', onFirstInteraction, true);
                  document.removeEventListener('touchstart', onFirstInteraction, true);
                  if (!isPlayingRef.current) {
                    setPlaying(true);
                  }
                  if (audioRef.current?.paused && isPlayingRef.current) {
                    audioRef.current.play().catch(() => {});
                  }
                  logAudioState('First interaction', 'autoplay triggered');
                };
                document.addEventListener('click', onFirstInteraction, true);
                document.addEventListener('touchstart', onFirstInteraction, true);
              });
            }
          };
          // Small delay to let the stream source initialize
          setTimeout(tryAutoplay, 500);
        }
      });
    }
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
      if (hlsRetryTimeoutRef.current) clearTimeout(hlsRetryTimeoutRef.current);
    };
  }, []);

  // Diagnostic listeners for background playback validation
  useEffect(() => {
    const onVisibility = () => logAudioState('visibilitychange', document.visibilityState);
    const onPageHide = () => logAudioState('pagehide');
    const onFocus = () => logAudioState('focus');
    const onBlur = () => logAudioState('blur');

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Cleanup helpers
  const cleanupHls = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    if (hlsRetryTimeoutRef.current) {
      clearTimeout(hlsRetryTimeoutRef.current);
      hlsRetryTimeoutRef.current = null;
    }
    if (audioRef.current) {
      // Clean up Safari native listeners if present
      (audioRef.current as any).__nativeCleanup?.();
      delete (audioRef.current as any).__nativeCleanup;
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
  }, []);

  const cleanupYt = useCallback(() => {
    ytPlayerRef.current?.destroy();
    ytPlayerRef.current = null;
  }, []);

  // HLS initialization helper (extracted for retry logic)
  const initHls = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setBuffering(false);
        logAudioState('HLS manifest parsed');
        if (isPlayingRef.current) audio.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            logAudioState('HLS fatal error', 'NETWORK — retrying startLoad()');
            setStreamError('Erro de conexão. Reconectando...');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            logAudioState('HLS fatal error', 'MEDIA — recovering');
            setStreamError('Erro de mídia. Recuperando...');
            hls.recoverMediaError();
          } else {
            // Other fatal errors — full retry after 10s
            logAudioState('HLS fatal error', `OTHER (${data.details}) — will retry in 10s`);
            setStreamError('Reconectando ao stream...');
            hlsRetryTimeoutRef.current = setTimeout(() => {
              logAudioState('HLS retry', 'reinitializing stream');
              hls.destroy();
              hlsRef.current = null;
              initHls(url);
            }, 10000);
          }
          setTimeout(() => setStreamError(null), 4000);
        }
      });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS — with error recovery
      audio.src = url;
      setBuffering(false);
      if (isPlayingRef.current) audio.play().catch(() => {});

      // Safari native HLS error recovery (retry after 10s)
      const onNativeError = () => {
        logAudioState('Safari native HLS error', 'will retry in 10s');
        setStreamError('Reconectando ao stream...');
        hlsRetryTimeoutRef.current = setTimeout(() => {
          logAudioState('Safari native HLS retry', 'reassigning source');
          audio.src = url;
          setStreamError(null);
          if (isPlayingRef.current) audio.play().catch(() => {
            console.warn('[HLS] Safari native retry failed');
          });
        }, 10000);
      };
      audio.addEventListener('error', onNativeError);

      // System interruption detection (phone calls, Siri) — stop playback
      const onInterruptPause = () => {
        if (isPlayingRef.current && !userInitiatedPauseRef.current && !isRetryingRef.current && !audio.error) {
          logAudioState('System interruption detected (native)', 'stopping playback');
          setPlaying(false);
        }
      };
      audio.addEventListener('pause', onInterruptPause);

      // Store cleanup refs for this path
      const nativeCleanup = () => {
        audio.removeEventListener('error', onNativeError);
        audio.removeEventListener('pause', onInterruptPause);
      };
      // Attach to audio element for cleanup in cleanupHls
      (audio as any).__nativeCleanup = nativeCleanup;
    }
  }, [setBuffering, setStreamError]);

  // Source management — react to stream URL changes
  const streamUrl = getCurrentStreamUrl();

  useEffect(() => {
    if (!streamUrl) return;

    // Sanitize legacy SHOUTcast suffixes (e.g. ",1") that break HTML5 audio
    const sanitizedUrl = streamUrl.replace(/,\d+$/, '/');

    // Cleanup previous source
    cleanupHls();
    cleanupYt();
    setBuffering(true);
    setStreamError(null);

    if (isYouTubeUrl(sanitizedUrl)) {
      activeSourceType.current = 'youtube';
      const videoId = extractYouTubeId(sanitizedUrl);
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

        let ready = false;
        const initTimeout = setTimeout(() => {
          if (!ready) {
            console.warn('[AudioEngine] YouTube player init timeout');
            setStreamError('YouTube demorou para responder. Tente novamente.');
            setBuffering(false);
            setTimeout(() => setStreamError(null), 5000);
          }
        }, 15000);

        const player = new window.YT.Player('yt-audio-player', {
          videoId,
          height: '1',
          width: '1',
          playerVars: {
            autoplay: isPlayingRef.current ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              ready = true;
              clearTimeout(initTimeout);
              setBuffering(false);
              player.setVolume(useRadioStore.getState().volume * 100);
              if (isPlayingRef.current) player.playVideo();
            },
            onStateChange: (event: { data: number }) => {
              if (event.data === 3) setBuffering(true);
              if (event.data === 1) { setBuffering(false); setStreamError(null); }
              if (event.data === -1 || event.data === 5) setBuffering(false);
            },
            onError: (event: { data: number }) => {
              ready = true;
              clearTimeout(initTimeout);
              const errorMap: Record<number, string> = {
                2: 'Parâmetro inválido no vídeo',
                5: 'Erro no player HTML5',
                100: 'Vídeo não encontrado ou removido',
                101: 'Vídeo não permite reprodução incorporada',
                150: 'Vídeo não permite reprodução incorporada',
              };
              const msg = errorMap[event.data] || `Erro YouTube (código ${event.data})`;
              console.error('[AudioEngine] YouTube error:', event.data, msg);
              setStreamError(msg);
              setBuffering(false);
              setTimeout(() => setStreamError(null), 6000);
            },
          },
        } as Record<string, unknown>);

        ytPlayerRef.current = player;
      });

      return () => {
        cleanupYt();
      };
    }

    // Determine if this is an HLS stream or a direct audio stream (Icecast/SHOUTcast)
    const isHlsStream = sanitizedUrl.includes('.m3u8');
    activeSourceType.current = 'hls'; // reuse same path for both

    if (isHlsStream) {
      initHls(sanitizedUrl);
    } else {
      // Direct audio stream (Icecast/SHOUTcast MP3/AAC) — just set src
      const audio = audioRef.current;
      if (audio) {
        audio.src = sanitizedUrl;
        setBuffering(false);
        if (isPlayingRef.current) audio.play().catch(() => {});
        logAudioState('Direct stream loaded', sanitizedUrl);

        // Error recovery for direct streams
        const onDirectError = () => {
          logAudioState('Direct stream error', 'will retry in 10s');
          setStreamError('Reconectando ao stream...');
          isRetryingRef.current = true;
          hlsRetryTimeoutRef.current = setTimeout(() => {
            logAudioState('Direct stream retry', 'reassigning source');
            isRetryingRef.current = false;
            audio.src = sanitizedUrl;
            setStreamError(null);
            // Force playing state so retry can work
            if (!isPlayingRef.current) setPlaying(true);
            audio.play().catch(() => {});
          }, 10000);
        };
        audio.addEventListener('error', onDirectError);

        // System interruption detection (phone calls) — stop playback
        const onDirectPause = () => {
          if (isPlayingRef.current && !userInitiatedPauseRef.current && !isRetryingRef.current && !audio.error) {
            logAudioState('System interruption detected (direct)', 'stopping playback');
            setPlaying(false);
          }
        };
        audio.addEventListener('pause', onDirectPause);

        (audio as any).__nativeCleanup = () => {
          audio.removeEventListener('error', onDirectError);
          audio.removeEventListener('pause', onDirectPause);
        };
      }
    }

    const audio = audioRef.current;
    if (!audio) return;

    const onWaiting = () => { setBuffering(true); logAudioState('audio waiting'); };
    const onPlaying = () => { setBuffering(false); setStreamError(null); logAudioState('audio playing'); };
    const onPause = () => logAudioState('audio pause');
    const onStalled = () => logAudioState('audio stalled');
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('stalled', onStalled);

    return () => {
      cleanupHls();
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('stalled', onStalled);
    };
  }, [streamUrl]);

  // Play/pause sync
  useEffect(() => {
    if (!streamUrl) return;

    if (activeSourceType.current === 'youtube' && ytPlayerRef.current) {
      if (isPlaying) ytPlayerRef.current.playVideo();
      else ytPlayerRef.current.pauseVideo();
    } else if (activeSourceType.current === 'hls' && audioRef.current) {
      if (isPlaying) {
        userInitiatedPauseRef.current = false;
        audioRef.current.play().catch(() => {});
      } else {
        userInitiatedPauseRef.current = true;
        audioRef.current.pause();
        // Reset flag after pause event fires
        setTimeout(() => { userInitiatedPauseRef.current = false; }, 100);
      }
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
        logAudioState('visibility resume', 'checking if audio needs restart');
        if (activeSourceType.current === 'hls' && audioRef.current) {
          if (audioRef.current.paused) {
            logAudioState('visibility resume', 'audio was paused — restarting');
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
