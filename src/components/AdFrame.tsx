import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useAdsRotation } from '@/hooks/useAdsRotation';

const AdFrame = () => {
  const { currentAd, totalAds, currentIndex, allAds } = useAdsRotation();

  if (!currentAd) return null;

  const Wrapper = currentAd.link_url ? 'a' : 'div';
  const wrapperProps = currentAd.link_url
    ? { href: currentAd.link_url, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Wrapper {...wrapperProps} className="block relative" style={{ aspectRatio: '16/9' }}>
            {currentAd.media_type === 'video' ? (
              <video
                src={currentAd.media_url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <img
                src={currentAd.media_url}
                alt={currentAd.name}
                className="w-full h-full object-cover rounded-2xl"
                loading="lazy"
              />
            )}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {currentAd.link_url && <ExternalLink className="h-2.5 w-2.5 text-white/50" />}
              <span className="text-[8px] text-white/40 font-medium uppercase tracking-wider">Anúncio</span>
            </div>
          </Wrapper>
        </motion.div>
      </AnimatePresence>

      {totalAds > 1 && (
        <div className="flex justify-center gap-1 mt-2 pb-1">
          {allAds.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex % totalAds ? 'w-4 bg-primary' : 'w-1 bg-muted-foreground/20'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdFrame;
