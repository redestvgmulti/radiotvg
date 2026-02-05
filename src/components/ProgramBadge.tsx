'use client';

import { motion } from 'framer-motion';
import { useRadioStore } from '@/store/useRadioStore';
import { transitions } from '@/motion/presets';

const modeMeta = {
  MUSIC_ONLY: {
    label: 'Ambient Mode',
    description: 'Fluxo musical contínuo'
  },
  PROGRAM_LIVE: {
    label: 'Program Live',
    description: 'Transmissão ao vivo'
  },
  COMMERCIAL_BREAK: {
    label: 'Intermission',
    description: 'Intervalo elegante'
  }
};

const modeDot: Record<string, { color: string; glow: string }> = {
  MUSIC_ONLY: { color: 'rgba(74, 219, 232, 0.85)', glow: '0 0 16px rgba(74, 219, 232, 0.45)' },
  PROGRAM_LIVE: { color: 'rgba(241, 200, 107, 0.9)', glow: '0 0 16px rgba(241, 200, 107, 0.45)' },
  COMMERCIAL_BREAK: { color: 'rgba(255, 111, 138, 0.85)', glow: '0 0 16px rgba(255, 111, 138, 0.45)' }
};

export const ProgramBadge = () => {
  const mode = useRadioStore((state) => state.mode);
  const programName = useRadioStore((state) => state.programName);

  return (
    <motion.div
      className="glass-chip flex items-center gap-4 rounded-full px-5 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.medium}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: modeDot[mode].color, boxShadow: modeDot[mode].glow }}
      />
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-text-muted">{modeMeta[mode].label}</p>
        <p className="text-sm font-semibold text-text-primary">{programName}</p>
      </div>
      <div className="hidden text-xs text-text-muted md:block">{modeMeta[mode].description}</div>
    </motion.div>
  );
};
