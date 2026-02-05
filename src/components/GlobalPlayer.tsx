'use client';

import { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { streams } from '@/data/streams';
import { useRadioStore } from '@/store/useRadioStore';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Equalizer } from '@/components/Equalizer';
import { VideoStage } from '@/components/VideoStage';
import { transitions } from '@/motion/presets';

const accentGlow: Record<string, string> = {
  'accent-cyan': '0 0 30px rgba(74, 219, 232, 0.35)',
  'accent-gold': '0 0 30px rgba(241, 200, 107, 0.35)',
  'accent-rose': '0 0 30px rgba(255, 111, 138, 0.35)',
  'accent-lime': '0 0 30px rgba(165, 243, 161, 0.35)'
};

export const GlobalPlayer = () => {
  const mode = useRadioStore((state) => state.mode);
  const streamId = useRadioStore((state) => state.streamId);
  const isPlaying = useRadioStore((state) => state.isPlaying);
  const volume = useRadioStore((state) => state.volume);
  const muted = useRadioStore((state) => state.muted);
  const togglePlay = useRadioStore((state) => state.togglePlay);
  const setVolume = useRadioStore((state) => state.setVolume);
  const setMuted = useRadioStore((state) => state.setMuted);
  const videoUrl = useRadioStore((state) => state.videoUrl);

  const stream = useMemo(() => streams.find((item) => item.id === streamId), [streamId]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useAudioPlayer({
    audioRef,
    src: stream?.audioUrl ?? '',
    isPlaying,
    volume,
    muted
  });

  const isLive = mode === 'PROGRAM_LIVE';
  const isBreak = mode === 'COMMERCIAL_BREAK';

  return (
    <motion.section
      layout
      transition={transitions.slow}
      className={`glass-panel-strong relative overflow-hidden rounded-[36px] p-6 md:p-8 ${
        isLive ? 'min-h-[420px]' : 'min-h-[260px]'
      }`}
      style={{ boxShadow: accentGlow[stream?.accent ?? 'accent-cyan'] }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_65%)]"
        animate={{ opacity: isLive ? 0.55 : 0.35, scale: isLive ? 1.02 : 1 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'url(/noise.svg)' }} />

      <div
        className={`relative grid h-full gap-6 ${
          isLive ? 'md:grid-cols-[1.4fr_1fr]' : 'md:grid-cols-[0.9fr_1.1fr]'
        }`}
      >
        <div className="flex h-full flex-col justify-center">
          <AnimatePresence mode="wait">
            {isLive ? (
              <motion.div key="video" layout="position" className="h-full">
                <VideoStage videoUrl={videoUrl} active={isLive} />
              </motion.div>
            ) : (
              <motion.div
                key="audio"
                layout="position"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={transitions.medium}
                className="flex h-full flex-col justify-center gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-3xl border border-white/10 bg-white/5 p-2">
                    <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Ambient Layer</p>
                    <p className="text-xl font-semibold text-text-primary">{stream?.name}</p>
                    <p className="text-sm text-text-muted">{stream?.mood}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Equalizer active={isPlaying} />
                  <p className="text-xs uppercase tracking-[0.35em] text-text-muted">
                    {isPlaying ? 'Respirando ao vivo' : 'Toque para iniciar'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex h-full flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Estado global</p>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-text-muted">
                {isLive ? 'Live' : isBreak ? 'Break' : 'Music'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-text-primary">{stream?.name}</p>
              <p className="text-sm text-text-muted">{stream?.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={togglePlay}
                className="glass-chip rounded-full px-6 py-3 text-xs uppercase tracking-[0.35em] text-text-primary"
                aria-label={isPlaying ? 'Pausar reprodução' : 'Ativar reprodução'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.fast}
              >
                {isPlaying ? 'Pausar' : 'Ativar'}
              </motion.button>
              <button
                onClick={() => setMuted(!muted)}
                className="rounded-full border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.35em] text-text-muted"
                aria-label={muted ? 'Ativar som' : 'Silenciar'}
              >
                {muted ? 'Mute' : 'Som'}
              </button>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Volume</p>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="mt-2 w-full accent-white"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} preload="metadata" />
    </motion.section>
  );
};
