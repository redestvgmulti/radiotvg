'use client';

import { RefObject, useEffect } from 'react';
import { useRadioStore } from '@/store/useRadioStore';

interface AudioPlayerOptions {
  audioRef: RefObject<HTMLAudioElement>;
  src: string;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
}

export const useAudioPlayer = ({ audioRef, src, isPlaying, volume, muted }: AudioPlayerOptions) => {
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
  }, [audioRef, volume, muted]);

  useEffect(() => {
    if (!audioRef.current) return;
    const element = audioRef.current;

    if (element.src !== src) {
      element.src = src;
    }

    if (isPlaying) {
      const playPromise = element.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay might be blocked; keep UI in paused state.
        });
      }

      // Update Media Session State
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }

    } else {
      element.pause();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  }, [audioRef, src, isPlaying]);

  // Media Session API Implementation
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Rádio TVG',
        artist: 'Complexo DBA Multiplace',
        album: 'Ao Vivo',
        artwork: [
          { src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=512&auto=format&fit=crop', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      // Action Handlers
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          useRadioStore.getState().togglePlay();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          useRadioStore.getState().togglePlay();
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          useRadioStore.getState().togglePlay();
        });
      } catch (e) {
        console.warn('Media Session actions warning', e);
      }
    }
  }, []);
};
