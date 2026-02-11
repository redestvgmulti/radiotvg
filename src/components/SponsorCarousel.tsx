import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Sponsor {
  id: string;
  name: string;
  image_url: string;
  link_url: string;
  display_time: number;
  is_active: boolean;
}

const SponsorCarousel = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setSponsors(data || []);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (sponsors.length === 0) return;
    const displayTime = sponsors[currentIndex]?.display_time ?? 15;
    const timer = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % sponsors.length);
    }, displayTime * 1000);
    return () => clearTimeout(timer);
  }, [currentIndex, sponsors]);

  if (sponsors.length === 0) return null;

  const sponsor = sponsors[currentIndex];

  return (
    <div className="mt-3">
      <AnimatePresence mode="wait">
        <motion.a
          key={sponsor.id}
          href={sponsor.link_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 glass-subtle rounded-lg px-4 py-3 group"
        >
          {sponsor.image_url ? (
            <img src={sponsor.image_url} alt={sponsor.name} className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
              {sponsor.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Patrocinador</p>
            <p className="text-sm font-medium text-foreground truncate">{sponsor.name}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.a>
      </AnimatePresence>
      {sponsors.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {sponsors.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-4 bg-primary' : 'w-1 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorCarousel;
