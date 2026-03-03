import { useRadioStore } from '@/stores/useRadioStore';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveBadge from '@/components/LiveBadge';

import envSertanejo from '@/assets/env-sertanejo.jpg';
import envPoprock from '@/assets/env-poprock.jpg';
import envRaiz from '@/assets/env-raiz.jpg';
import envGospel from '@/assets/env-gospel.jpg';

const localImageMap: Record<string, string> = {
  sertanejo: envSertanejo,
  poprock: envPoprock,
  raiz: envRaiz,
  gospel: envGospel,
};

/**
 * PersistentPlayer — Fixed bottom player bar (above BottomNav).
 * Compact, professional streaming-style player.
 */
const PersistentPlayer = () => {
  const {
    isPlaying, togglePlay, volume, setVolume,
    currentTrack, getCurrentEnvironment, getCurrentStreamUrl,
    isBuffering, streamError, isLive,
  } = useRadioStore();

  const env = getCurrentEnvironment();
  const streamUrl = getCurrentStreamUrl();
  const imgSrc = env?.image_url || localImageMap[env?.slug || 'sertanejo'] || localImageMap.sertanejo;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 player-bar-gradient border-t border-white/[0.06] bottom-safe">
      <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto flex items-center gap-3 px-4 py-2.5">
        {/* Album art */}
        <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.img
              key={env?.slug}
              src={imgSrc}
              alt={env?.label || 'Rádio TVG'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          {isPlaying && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="flex items-end gap-[2px] h-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-[2px] rounded-full bg-primary-foreground"
                    animate={{ height: [3, 10 + Math.random() * 6, 4, 12 + Math.random() * 4, 3] }}
                    transition={{ duration: 0.8 + i * 0.2, repeat: Infinity, repeatType: 'reverse' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-foreground text-sm font-semibold truncate leading-tight">
              {currentTrack.title}
            </p>
            {isLive && (
              <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-live/20">
                <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
                <span className="text-[8px] font-bold text-live uppercase">LIVE</span>
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs truncate mt-0.5">{currentTrack.artist}</p>
          {isBuffering && isPlaying && (
            <p className="text-accent text-[9px] mt-0.5 animate-pulse">Carregando...</p>
          )}
          {streamError && (
            <p className="text-destructive text-[9px] mt-0.5 truncate">{streamError}</p>
          )}
        </div>

        {/* Volume */}
        <button
          onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Play/Pause */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          disabled={!streamUrl}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-shadow disabled:opacity-40 disabled:shadow-none"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </motion.button>
      </div>
    </div>
  );
};

export default PersistentPlayer;
