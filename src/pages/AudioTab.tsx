import { motion } from 'framer-motion';
import HeroPlayer from '@/components/HeroPlayer';
import EnvironmentSelector from '@/components/EnvironmentSelector';
import LiveBadge from '@/components/LiveBadge';
import SponsorCarousel from '@/components/SponsorCarousel';
import { useRadioStore } from '@/stores/useRadioStore';
import logoRadio from '@/assets/logo-radio-tvg.png';

const AudioTab = () => {
  const { isLive } = useRadioStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-24"
    >
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="h-10 sm:h-11 md:h-12 overflow-hidden flex items-center">
          <img src={logoRadio} alt="Rádio TVG" className="h-[200%] w-auto object-contain object-center" />
        </div>
        {isLive && <LiveBadge />}
      </header>

      <div className="px-4">
        <HeroPlayer />
      </div>

      <div className="mt-5 px-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
          Ambientes
        </p>
        <EnvironmentSelector />
      </div>

      <div className="mt-4 px-4">
        <SponsorCarousel />
      </div>
    </motion.div>
  );
};

export default AudioTab;
