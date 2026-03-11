import { useEffect, useRef } from 'react';
import { useRadioStore } from '@/stores/useRadioStore';
import { supabase } from '@/integrations/supabase/client';

const POLL_INTERVAL = 15000; // 15 seconds

/**
 * Polls the stream-metadata edge function to get the current
 * song title & artist from the SHOUTcast/Icecast stream.
 * Updates the Zustand store's currentTrack when metadata changes.
 */
export const useStreamMetadata = () => {
  const {
    isPlaying,
    getCurrentStreamUrl,
    getCurrentEnvironment,
    currentEnvironmentSlug,
  } = useRadioStore();

  const lastRawRef = useRef('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const streamUrl = getCurrentStreamUrl();
    const env = getCurrentEnvironment();

    // Clear interval when not playing or no stream
    if (!isPlaying || !streamUrl) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset to default when stopped
      lastRawRef.current = '';
      useRadioStore.getState().setCurrentTrack({
        title: env?.label || 'Rádio TVG ao Vivo',
        artist: env?.description || 'Transmissão Contínua',
        album: 'Rádio TVG',
      });
      return;
    }

    // Skip YouTube streams — no ICY metadata
    if (streamUrl.includes('youtube.com') || streamUrl.includes('youtu.be')) {
      return;
    }

    const fetchMetadata = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stream-metadata', {
          body: { stream_url: streamUrl },
        });

        if (error || !data) return;

        const { title, artist, raw } = data as { title: string; artist: string; raw: string };

        // Only update if metadata actually changed
        if (raw && raw !== lastRawRef.current) {
          lastRawRef.current = raw;
          useRadioStore.getState().setCurrentTrack({
            title: title || env?.label || 'Rádio TVG ao Vivo',
            artist: artist || env?.description || 'Transmissão Contínua',
            album: 'Rádio TVG',
          });
        }
      } catch {
        // Silently fail — metadata is non-critical
      }
    };

    // Fetch immediately, then poll
    fetchMetadata();
    intervalRef.current = setInterval(fetchMetadata, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, currentEnvironmentSlug]);
};
