'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Background } from '@/components/Background';
import { Sidebar } from '@/components/Sidebar';
import { GlobalPlayer } from '@/components/GlobalPlayer';
import { ProgramBadge } from '@/components/ProgramBadge';
import { StreamSwitcher } from '@/components/StreamSwitcher';
import { useRadioStatus } from '@/hooks/useRadioStatus';
import { useRadioStore } from '@/store/useRadioStore';
import { formatClock } from '@/lib/time';
import { fadeUp, transitions } from '@/motion/presets';

export const RadioExperience = () => {
  useRadioStatus();

  const mode = useRadioStore((state) => state.mode);
  const programName = useRadioStore((state) => state.programName);
  const startedAt = useRadioStore((state) => state.startedAt);

  const isBreak = mode === 'COMMERCIAL_BREAK';
  const isLive = mode === 'PROGRAM_LIVE';

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Background />
      <div className="grid h-full grid-cols-1 md:grid-cols-[260px_1fr]">
        <Sidebar />

        <main className="relative flex h-full flex-col gap-8 overflow-hidden px-6 py-8 md:px-10">
          <motion.header
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            variants={fadeUp}
            initial="initial"
            animate="animate"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Streaming audiovisual vivo</p>
              <h1 className="font-display text-3xl text-text-primary md:text-4xl">
                Experiência Cinematográfica 3.0
              </h1>
              <p className="max-w-xl text-sm text-text-muted">
                O ambiente reage ao conteúdo em tempo real, criando presença e continuidade emocional.
              </p>
            </div>
            <ProgramBadge />
          </motion.header>

          <div className="grid flex-1 gap-6 lg:grid-cols-[1.6fr_0.8fr]">
            <div className="flex flex-col gap-6">
              <GlobalPlayer />

              <div className="glass-panel rounded-[28px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Programa</p>
                    <p className="text-lg font-semibold text-text-primary">{programName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Início</p>
                    <p className="text-lg font-semibold text-text-primary">{formatClock(startedAt)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-2 flex-1 rounded-full bg-white/10">
                    <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-accent-cyan/70 to-accent-gold/70" />
                  </div>
                  <p className="text-xs text-text-muted">Fluxo contínuo</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel rounded-[28px] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Status</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-text-muted">
                    {isLive ? 'Live' : isBreak ? 'Break' : 'Ambient'}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-lg font-semibold text-text-primary">{isLive ? 'Spotlight Mode' : isBreak ? 'Intermission' : 'Ambient Mode'}</p>
                  <p className="text-sm text-text-muted">
                    {isLive
                      ? 'O vídeo assume o palco e a interface ganha intensidade.'
                      : isBreak
                      ? 'Intervalo suave com continuidade estética.'
                      : 'A interface respira lentamente com texturas orgânicas.'}
                  </p>
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Troca de stream</p>
                <div className="mt-4">
                  <StreamSwitcher />
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Pulso da audiência</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-primary">Presença contínua</p>
                    <p className="text-sm text-text-muted">92%</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-accent-rose/60 via-accent-cyan/60 to-accent-gold/60"
                      animate={{ width: isBreak ? '62%' : isLive ? '88%' : '74%' }}
                      transition={transitions.slow}
                    />
                  </div>
                  <p className="text-xs text-text-muted">Feedback micro contínuo para retenção absoluta.</p>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isBreak && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={transitions.medium}
                className="pointer-events-none absolute bottom-6 right-10 hidden rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.4em] text-text-muted md:block"
              >
                Intermission Mode
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
