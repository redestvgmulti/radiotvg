'use client';

import { motion } from 'framer-motion';
import { useRadioStore } from '@/store/useRadioStore';
import { transitions } from '@/motion/presets';
import '@/style/ProgramBadge.css';

const modeMeta = {
  MUSIC_ONLY: {
    label: 'Sessão Flow',
    description: 'Fluxo musical contínuo'
  },
  PROGRAM_LIVE: {
    label: 'Ao Vivo',
    description: 'Transmissão ao vivo'
  },
  COMMERCIAL_BREAK: {
    label: 'Intervalo',
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
      className="program-badge-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.medium}
    >
      <span
        className="program-badge-dot"
        style={{ backgroundColor: modeDot[mode].color, boxShadow: modeDot[mode].glow }}
      />
      <div className="program-badge-content">
        <p className="program-badge-label">{modeMeta[mode].label}</p>
        <p className="program-badge-name">{programName}</p>
      </div>
      <div className="program-badge-description">{modeMeta[mode].description}</div>
    </motion.div>
  );
};
