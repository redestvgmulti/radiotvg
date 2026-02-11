import { useRadioStore, environmentMeta, type Environment } from '@/stores/useRadioStore';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import envSertanejo from '@/assets/env-sertanejo.jpg';
import envPoprock from '@/assets/env-poprock.jpg';
import envRaiz from '@/assets/env-raiz.jpg';
import envGospel from '@/assets/env-gospel.jpg';

const imageMap: Record<Environment, string> = {
  sertanejo: envSertanejo,
  poprock: envPoprock,
  raiz: envRaiz,
  gospel: envGospel,
};

const glowMap: Record<Environment, string> = {
  sertanejo: 'shadow-[0_8px_80px_-12px_hsl(var(--env-sertanejo)/0.35)]',
  poprock: 'shadow-[0_8px_80px_-12px_hsl(var(--env-poprock)/0.35)]',
  raiz: 'shadow-[0_8px_80px_-12px_hsl(var(--env-raiz)/0.35)]',
  gospel: 'shadow-[0_8px_80px_-12px_hsl(var(--env-gospel)/0.35)]',
};

const HeroPlayer = () => {
  const { isPlaying, togglePlay, volume, setVolume, currentEnvironment, currentTrack } =
    useRadioStore();
  const meta = environmentMeta[currentEnvironment];

  return (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-3xl ${glowMap[currentEnvironment]} transition-shadow duration-500`}
      style={{ height: '65vh', minHeight: 360, maxHeight: 600 }}
    >
      {/* Background Image with crossfade */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentEnvironment}
          src={imageMap[currentEnvironment]}
          alt={meta.label}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Glassmorphism bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-7">
        {/* Visualizer bars */}
        <div className="flex items-end justify-center gap-[3px] h-10 mb-6 opacity-80">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full bg-white/70"
              animate={{
                height: isPlaying
                  ? [4, 14 + Math.random() * 20, 8, 22 + Math.random() * 12, 4]
                  : 3,
              }}
              transition={{
                duration: 1.2 + Math.random() * 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.04,
              }}
            />
          ))}
        </div>

        {/* Track info */}
        <div className="text-center mb-5">
          <p className="text-white/50 text-xs font-medium uppercase tracking-[0.15em] mb-1">
            {meta.label}
          </p>
          <p className="text-white text-xl font-display font-bold leading-tight">
            {currentTrack.title}
          </p>
          <p className="text-white/60 text-sm mt-1">{currentTrack.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          {/* Volume toggle */}
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="p-2 text-white/50 hover:text-white transition-colors duration-200"
          >
            {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          {/* Play/Pause — large */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="h-7 w-7 ml-0.5" />
            )}
          </motion.button>

          {/* Volume slider */}
          <div className="w-20">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-[3px] rounded-full appearance-none bg-white/20 cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroPlayer;
