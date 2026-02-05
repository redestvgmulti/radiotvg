'use client';

import { useEffect } from 'react';
import { useRadioStore } from '@/store/useRadioStore';

export const useRadioStatus = () => {
  const setStatus = useRadioStore((state) => state.setStatus);

  useEffect(() => {
    let active = true;

    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/radio-status');
        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;
        setStatus({
          mode: data.mode,
          programName: data.program_name,
          videoUrl: data.video_url,
          startedAt: data.started_at
        });
      } catch (error) {
        // Fail silently, keep last known status
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [setStatus]);
};
