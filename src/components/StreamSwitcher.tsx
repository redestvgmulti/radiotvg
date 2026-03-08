'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { streams } from '@/data/streams';
import { useRadioStore } from '@/store/useRadioStore';
import '@/style/StreamSwitcher.css';

export const StreamSwitcher = () => {
  const streamId = useRadioStore((state) => state.streamId);
  const setStream = useRadioStore((state) => state.setStream);

  return (
    <section className="stream-switcher-container">
      <div className="stream-switcher-scroll">
        {streams.map((stream) => {
          const isActive = streamId === stream.id;

          return (
            <motion.button
              key={stream.id}
              onClick={() => setStream(stream.id)}
              className={`stream-switcher-card ${isActive ? 'stream-switcher-card-active' : 'stream-switcher-card-inactive'}`}
              style={{
                boxShadow: isActive ? `0 20px 40px -10px ${stream.theme.shadow.replace('shadow-', '')}` : 'none'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="stream-switcher-background"
                style={{ backgroundImage: `url(${stream.cover})` }}
              />

              <div className={`stream-switcher-gradient ${stream.theme.gradient}`} />
              <div className="stream-switcher-text-gradient" />

              <div className="stream-switcher-content">
                <div className="stream-switcher-text-wrapper">
                  <h3 className="stream-switcher-title">
                    {stream.name}
                    {isActive && (
                      <motion.span
                        layoutId="active-dot"
                        className={`stream-switcher-active-dot ${stream.theme.color.replace('text-', 'bg-')}`}
                      />
                    )}
                  </h3>
                  <p className={`stream-switcher-description ${stream.theme.color}`}>
                    {isActive ? 'Tocando agora' : stream.description}
                  </p>
                </div>
              </div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="stream-switcher-shine"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
