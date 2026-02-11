import { useRadioStore } from '@/stores/useRadioStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const SponsorCarousel = () => {
  const { sponsors, isLive } = useRadioStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeSponsors = sponsors.filter((s) => s.active);

  useEffect(() => {
    if (isLive || activeSponsors.length === 0) return;
    const displayTime = activeSponsors[currentIndex]?.displayTime ?? 5;
    const timer = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % activeSponsors.length);
    }, displayTime * 1000);
    return () => clearTimeout(timer);
  }, [currentIndex, isLive, activeSponsors]);

  if (isLive || activeSponsors.length === 0) return null;

  const sponsor = activeSponsors[currentIndex];

  return (
    <div className="mt-3">
      <AnimatePresence mode="wait">
        <motion.a
          key={sponsor.id}
          href={sponsor.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 glass-subtle rounded-lg px-4 py-3 group"
        >
          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
            {sponsor.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Patrocinador</p>
            <p className="text-sm font-medium text-foreground truncate">{sponsor.name}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.a>
      </AnimatePresence>
      {activeSponsors.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {activeSponsors.map((_, i) => (
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
