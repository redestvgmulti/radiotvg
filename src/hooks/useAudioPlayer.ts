'use client';

import { RefObject, useEffect } from 'react';

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
    } else {
      element.pause();
    }
  }, [audioRef, src, isPlaying]);
};
