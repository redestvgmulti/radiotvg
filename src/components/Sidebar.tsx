'use client';

import { motion } from 'framer-motion';
import { useRadioStore } from '@/store/useRadioStore';
import { streams } from '@/data/streams';
import { fadeUp } from '@/motion/presets';

const navItems = [
  { label: 'Ambiente', hint: 'Fluxo contínuo' },
  { label: 'Programas', hint: 'Curadoria ao vivo' },
  { label: 'Arquivos', hint: 'Momentos gravados' },
  { label: 'Explorar', hint: 'Novas camadas' }
];

export const Sidebar = () => {
  const streamId = useRadioStore((state) => state.streamId);
  const stream = streams.find((item) => item.id === streamId);

  return (
    <aside className="flex w-full flex-col justify-between border-b border-white/5 px-6 py-4 md:h-full md:w-auto md:border-b-0 md:border-r md:px-6 md:py-10">
      <div className="flex items-center justify-between gap-6 md:flex-col md:items-start md:justify-start md:gap-10">
        <div className="space-y-2">
          <p className="font-display text-2xl tracking-[0.3em] text-accent-cyan/80">RTVG</p>
          <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted">Cinematic Streaming</p>
        </div>

        <nav className="flex gap-6 md:flex-col md:gap-6">
          {navItems.map((item, index) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.08 }}
              className="space-y-1"
            >
              <p className="text-xs font-semibold tracking-[0.2em] text-text-primary md:text-sm">{item.label}</p>
              <p className="hidden text-xs text-text-muted md:block">{item.hint}</p>
            </motion.div>
          ))}
        </nav>
      </div>

      <div className="hidden space-y-2 md:block">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Stream ativo</p>
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-text-primary">{stream?.name}</p>
          <p className="text-xs text-text-muted">{stream?.description}</p>
        </div>
      </div>
    </aside>
  );
};
