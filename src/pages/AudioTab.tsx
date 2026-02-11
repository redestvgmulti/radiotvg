import { motion } from 'framer-motion';
import EnvironmentSelector from '@/components/EnvironmentSelector';
import AudioPlayerCard from '@/components/AudioPlayerCard';
import { Radio } from 'lucide-react';

const AudioTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 px-4 pt-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Radio className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">Rádio TVG</h1>
          <p className="text-xs text-muted-foreground">Transmissão contínua</p>
        </div>
      </div>

      {/* Environment Selector */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Ambientes
        </p>
        <EnvironmentSelector />
      </div>

      {/* Main Player Card */}
      <div className="relative">
        <AudioPlayerCard />
      </div>

      {/* Quick Info */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="glass-subtle rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Ouvintes</p>
          <p className="text-xl font-display font-bold text-foreground">1.2K</p>
        </div>
        <div className="glass-subtle rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">No ar há</p>
          <p className="text-xl font-display font-bold text-foreground">3h 42m</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioTab;
