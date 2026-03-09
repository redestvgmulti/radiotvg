import { useEffect, useRef } from 'react';
import { useRadioStore } from '@/stores/useRadioStore';
import { supabase } from '@/integrations/supabase/client';

const HEARTBEAT_INTERVAL = 60_000; // 60 seconds

export const useListeningTracker = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isPlaying, getCurrentEnvironment } = useRadioStore();

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const sendHeartbeat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Only track logged-in users

      const env = getCurrentEnvironment();
      try {
        await supabase.functions.invoke('listening-heartbeat', {
          body: { station_id: env?.id || null },
        });
      } catch {
        // Silent fail — don't disrupt playback
      }
    };

    // Send first heartbeat after 60s
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, getCurrentEnvironment]);
};
