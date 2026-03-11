import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRadioStore } from '@/stores/useRadioStore';

interface Ad {
  id: string;
  name: string;
  media_url: string;
  media_type: string;
  link_url: string;
  display_duration: number;
  station_ids: string[];
}

export const useAdsRotation = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getCurrentEnvironment } = useRadioStore();
  const env = getCurrentEnvironment();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('ads')
        .select('id, name, media_url, media_type, link_url, display_duration, station_ids')
        .eq('is_active', true)
        .order('sort_order');
      setAds((data as Ad[]) || []);
    };
    load();
  }, []);

  const filtered = ads.filter(ad =>
    ad.station_ids.length === 0 || (env && ad.station_ids.includes(env.id))
  );

  const rotate = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % filtered.length);
  }, [filtered.length]);

  useEffect(() => {
    if (filtered.length <= 1) return;
    const current = filtered[currentIndex];
    if (!current) return;
    timerRef.current = setTimeout(rotate, current.display_duration * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, filtered, rotate]);

  const currentAd = filtered.length > 0 ? filtered[currentIndex % filtered.length] : null;

  return { currentAd, allAds: filtered, currentIndex, totalAds: filtered.length };
};
