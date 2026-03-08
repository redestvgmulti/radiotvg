'use client';

import { motion } from 'framer-motion';
import { useRadioStore } from '@/store/useRadioStore';
import '@/style/Background.css';

const modeIntensity = {
  MUSIC_ONLY: 0.7,
  PROGRAM_LIVE: 1,
  COMMERCIAL_BREAK: 0.55
};

export const Background = () => {
  const mode = useRadioStore((state) => state.mode);

  return (
    <div className="background-container">
      <motion.div
        className="background-gradient-blue"
        animate={{
          opacity: modeIntensity[mode],
          scale: mode === 'PROGRAM_LIVE' ? 1.2 : 1,
        }}
        transition={{ duration: 2.4, ease: 'easeInOut' }}
      />
      <motion.div
        className="background-gradient-cyan"
        animate={{
          opacity: modeIntensity[mode] * 0.8,
          scale: mode === 'MUSIC_ONLY' ? 1.15 : 0.95
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      <div className="background-radial-overlay" />
      <div className="background-noise" />
      <div className="background-linear-overlay" />
    </div>
  );
};

