import { useEffect, useRef } from 'react';
import { useRadioStore } from '@/stores/useRadioStore';

/**
 * PlaybackController — coordinates audio vs video playback.
 * When video becomes active, pauses audio. When video stops, resumes if was playing.
 */
const PlaybackController = () => {
  const { isPlaying, isVideoActive, setPlaying } = useRadioStore();
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    if (isVideoActive) {
      // Video opened — pause audio, remember state
      wasPlayingRef.current = isPlaying;
      if (isPlaying) setPlaying(false);
    } else {
      // Video closed — resume if was playing
      if (wasPlayingRef.current) {
        setPlaying(true);
        wasPlayingRef.current = false;
      }
    }
  }, [isVideoActive]);

  return null;
};

export default PlaybackController;
