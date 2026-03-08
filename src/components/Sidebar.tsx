'use client';

import { motion } from 'framer-motion';
import { useRadioStore } from '@/store/useRadioStore';
import { streams } from '@/data/streams';
import { fadeUp } from '@/motion/presets';
import '@/style/Sidebar.css';

const navItems = [
  { label: 'Atmosferas', hint: 'Sintonize' },
  { label: 'Programas', hint: 'No ar' },
  { label: 'Acervo', hint: 'Replay' },
  { label: 'Breve', hint: 'Futuro' }
];

export const Sidebar = () => {
  const streamId = useRadioStore((state) => state.streamId);
  const stream = streams.find((item) => item.id === streamId);

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <p className="sidebar-logo-text">RTVG</p>
          <p className="sidebar-logo-subtitle">Cinematic Streaming</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.08 }}
              className="sidebar-nav-item"
            >
              <p className="sidebar-nav-label">{item.label}</p>
              <p className="sidebar-nav-hint">{item.hint}</p>
            </motion.div>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <p className="sidebar-footer-label">Ouvindo</p>
        <div className="sidebar-stream-card">
          <p className="sidebar-stream-name">{stream?.name}</p>
          <p className="sidebar-stream-description">{stream?.description}</p>
        </div>
      </div>
    </aside>
  );
};
