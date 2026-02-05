'use client';

import { motion } from 'framer-motion';
import { streams } from '@/data/streams';
import { useRadioStore } from '@/store/useRadioStore';
import { transitions } from '@/motion/presets';

const accentStyles: Record<string, { glow: string; border: string }> = {
  'accent-cyan': {
    glow: '0 0 24px rgba(74, 219, 232, 0.35)',
    border: 'rgba(74, 219, 232, 0.35)'
  },
  'accent-gold': {
    glow: '0 0 24px rgba(241, 200, 107, 0.35)',
    border: 'rgba(241, 200, 107, 0.35)'
  },
  'accent-rose': {
    glow: '0 0 24px rgba(255, 111, 138, 0.35)',
    border: 'rgba(255, 111, 138, 0.35)'
  },
  'accent-lime': {
    glow: '0 0 24px rgba(165, 243, 161, 0.35)',
    border: 'rgba(165, 243, 161, 0.35)'
  }
};

export const StreamSwitcher = () => {
  const streamId = useRadioStore((state) => state.streamId);
  const setStream = useRadioStore((state) => state.setStream);

  return (
    <div className="grid grid-cols-2 gap-3">
      {streams.map((stream) => {
        const active = stream.id === streamId;
        const accent = accentStyles[stream.accent];

        return (
          <motion.button
            key={stream.id}
            onClick={() => setStream(stream.id)}
            className={`glass-panel flex flex-col items-start gap-2 rounded-2xl px-4 py-3 text-left transition ${
              active ? 'ring-1 ring-white/20' : 'opacity-80 hover:opacity-100'
            }`}
            style={
              active
                ? { boxShadow: accent.glow, borderColor: accent.border }
                : { borderColor: 'rgba(255,255,255,0.08)' }
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={transitions.fast}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent.border }} />
              <p className="text-sm font-semibold text-text-primary">{stream.name}</p>
            </div>
            <p className="text-xs text-text-muted">{stream.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
};
