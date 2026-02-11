import { motion } from 'framer-motion';
import HeroPlayer from '@/components/HeroPlayer';
import EnvironmentSelector from '@/components/EnvironmentSelector';
import LiveBadge from '@/components/LiveBadge';
import SponsorCarousel from '@/components/SponsorCarousel';
import { useRadioStore } from '@/stores/useRadioStore';

const AudioTab = () => {
  const { isLive } = useRadioStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-24"
    >
      {/* Minimal Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        <h1 className="text-lg font-display font-bold text-foreground tracking-tight">
          Rádio TVG
        </h1>
        {isLive && <LiveBadge />}
      </header>

      {/* Hero Player — 65vh dominant card */}
      <div className="px-4">
        <HeroPlayer />
      </div>

      {/* Environment Cards */}
      <div className="mt-5 px-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
          Ambientes
        </p>
        <EnvironmentSelector />
      </div>

      {/* Sponsor (subtle, bottom) */}
      <div className="mt-4 px-4">
        <SponsorCarousel />
      </div>
    </motion.div>
  );
};

export default AudioTab;
