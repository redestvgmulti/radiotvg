import { useRadioStore, environmentMeta, type Environment } from '@/stores/useRadioStore';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import LiveBadge from './LiveBadge';
import SponsorCarousel from './SponsorCarousel';

const glowMap: Record<Environment, string> = {
  sertanejo: 'shadow-[0_0_60px_-10px_hsl(var(--env-sertanejo)/0.3)]',
  poprock: 'shadow-[0_0_60px_-10px_hsl(var(--env-poprock)/0.3)]',
  raiz: 'shadow-[0_0_60px_-10px_hsl(var(--env-raiz)/0.3)]',
  gospel: 'shadow-[0_0_60px_-10px_hsl(var(--env-gospel)/0.3)]',
};

const gradientMap: Record<Environment, string> = {
  sertanejo: 'from-env-sertanejo/10 to-transparent',
  poprock: 'from-env-poprock/10 to-transparent',
  raiz: 'from-env-raiz/10 to-transparent',
  gospel: 'from-env-gospel/10 to-transparent',
};

const AudioPlayerCard = () => {
  const { isPlaying, togglePlay, volume, setVolume, currentEnvironment, isLive, currentTrack } =
    useRadioStore();
  const meta = environmentMeta[currentEnvironment];

  return (
    <motion.div
      layout
      className={`glass rounded-2xl p-6 ${glowMap[currentEnvironment]} transition-shadow duration-500`}
    >
      {/* Ambient gradient */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradientMap[currentEnvironment]} pointer-events-none transition-all duration-500`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">{meta.label}</h2>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
          {isLive && <LiveBadge />}
        </div>

        {/* Visualizer placeholder */}
        <div className="flex items-end justify-center gap-[3px] h-16 mb-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-primary/60"
              animate={{
                height: isPlaying ? [8, 20 + Math.random() * 28, 12, 32 + Math.random() * 16, 8] : 4,
              }}
              transition={{
                duration: 1.2 + Math.random() * 0.8,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.05,
              }}
            />
          ))}
        </div>

        {/* Track info */}
        <div className="text-center mb-6">
          <p className="text-base font-semibold text-foreground">{currentTrack.title}</p>
          <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Volume */}
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          {/* Play/Pause */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:brightness-110 transition-all"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </motion.button>

          {/* Volume slider */}
          <div className="flex items-center gap-2 w-20">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Sponsor carousel */}
        <SponsorCarousel />
      </div>
    </motion.div>
  );
};

export default AudioPlayerCard;
