import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
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

const AdDisplay = () => {
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

  // Filter by current station
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

  if (filtered.length === 0) return null;
  const ad = filtered[currentIndex % filtered.length];
  if (!ad) return null;

  const Wrapper = ad.link_url ? 'a' : 'div';
  const wrapperProps = ad.link_url ? { href: ad.link_url, target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Wrapper {...wrapperProps} className="block relative">
            {ad.media_type === 'video' ? (
              <video
                src={ad.media_url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto max-h-40 object-cover rounded-2xl"
              />
            ) : (
              <img
                src={ad.media_url}
                alt={ad.name}
                className="w-full h-auto max-h-40 object-cover rounded-2xl"
                loading="lazy"
              />
            )}
            {/* Subtle sponsor label */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {ad.link_url && <ExternalLink className="h-2.5 w-2.5 text-white/50" />}
              <span className="text-[8px] text-white/40 font-medium uppercase tracking-wider">Anúncio</span>
            </div>
          </Wrapper>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      {filtered.length > 1 && (
        <div className="flex justify-center gap-1 mt-2 pb-1">
          {filtered.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex % filtered.length ? 'w-4 bg-primary' : 'w-1 bg-muted-foreground/20'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdDisplay;
