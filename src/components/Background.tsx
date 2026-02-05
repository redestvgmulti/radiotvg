'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { streams } from '@/data/streams';
import { useRadioStore } from '@/store/useRadioStore';

const modeIntensity = {
  MUSIC_ONLY: 0.7,
  PROGRAM_LIVE: 1,
  COMMERCIAL_BREAK: 0.55
};

const accentMap: Record<string, string> = {
  'accent-cyan': 'rgba(74, 219, 232, 0.2)',
  'accent-gold': 'rgba(241, 200, 107, 0.2)',
  'accent-rose': 'rgba(255, 111, 138, 0.2)',
  'accent-lime': 'rgba(165, 243, 161, 0.2)'
};

export const Background = () => {
  const mode = useRadioStore((state) => state.mode);
  const streamId = useRadioStore((state) => state.streamId);

  const accent = useMemo(() => {
    return streams.find((stream) => stream.id === streamId)?.accent ?? 'accent-cyan';
  }, [streamId]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent-cyan/20 blur-[120px]"
        animate={{
          opacity: modeIntensity[mode],
          scale: mode === 'PROGRAM_LIVE' ? 1.2 : 1,
          y: mode === 'COMMERCIAL_BREAK' ? 40 : 0
        }}
        transition={{ duration: 2.4, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-120px] left-[-80px] h-[420px] w-[420px] rounded-full bg-accent-gold/20 blur-[140px]"
        animate={{
          opacity: modeIntensity[mode],
          scale: mode === 'MUSIC_ONLY' ? 1.15 : 0.95
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />
      <motion.div
        className=\"absolute top-[20%] right-[-120px] h-[460px] w-[460px] rounded-full blur-[140px]\"
        style={{ backgroundColor: accentMap[accent] ?? accentMap['accent-cyan'] }}
        animate={{
          opacity: modeIntensity[mode],
          scale: mode === 'PROGRAM_LIVE' ? 1.25 : 1
        }}
        transition={{ duration: 3.2, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(19,25,38,0.85),_rgba(5,6,10,0.9))]" />
      <div className="absolute inset-0 mix-blend-soft-light opacity-40" style={{ backgroundImage: 'url(/noise.svg)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(74,219,232,0.08), transparent 55%, rgba(241,200,107,0.08))' }} />
    </div>
  );
};
