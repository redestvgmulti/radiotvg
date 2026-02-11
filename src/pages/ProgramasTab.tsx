import { motion } from 'framer-motion';
import { Clock, Headphones, ChevronRight } from 'lucide-react';
import heroProgramas from '@/assets/hero-programas.jpg';
import logoRadio from '@/assets/logo-radio-tvg.png';

import thumbManhaSertaneja from '@/assets/thumb-manha-sertaneja.jpg';
import thumbTopHits from '@/assets/thumb-top-hits.jpg';
import thumbShowRaiz from '@/assets/thumb-show-raiz.jpg';
import thumbGospelNight from '@/assets/thumb-gospel-night.jpg';
import thumbEntrevista from '@/assets/thumb-entrevista.jpg';

const mockPrograms = [
  { id: '1', name: 'Manhã Sertaneja', schedule: 'Seg-Sex · 6h–10h', host: 'DJ Ricardo', thumb: thumbManhaSertaneja, isNow: true },
  { id: '2', name: 'Tarde Pop', schedule: 'Seg-Sex · 14h–18h', host: 'Ana Costa', thumb: thumbTopHits, isNow: false },
  { id: '3', name: 'Noite Raiz', schedule: 'Seg-Sáb · 20h–00h', host: 'Seu Jorge', thumb: thumbShowRaiz, isNow: false },
  { id: '4', name: 'Gospel ao Amanhecer', schedule: 'Diário · 5h–6h', host: 'Pastor Lucas', thumb: thumbGospelNight, isNow: false },
  { id: '5', name: 'Entrevista Especial', schedule: 'Sáb · 12h–14h', host: 'Maria Rios', thumb: thumbEntrevista, isNow: false },
];

const ProgramasTab = () => {
  const nowPlaying = mockPrograms.find((p) => p.isNow);
  const otherPrograms = mockPrograms.filter((p) => !p.isNow);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-24"
    >
      {/* Minimal Header */}
      <header className="px-5 pt-4 pb-2">
        <img src={logoRadio} alt="Rádio TVG" className="h-8 sm:h-9 md:h-10 w-auto object-contain" />
      </header>

      {/* Hero — Now Playing Program */}
      {nowPlaying && (
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="relative mx-4 mb-5 rounded-3xl overflow-hidden cursor-pointer group"
          style={{ height: '35vh', minHeight: 200, maxHeight: 320 }}
        >
          <img
            src={nowPlaying.thumb}
            alt={nowPlaying.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

          {/* On Air badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <Headphones className="h-3 w-3 text-primary-foreground" />
            <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider">No Ar</span>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-5">
            <p className="text-white text-xl font-display font-bold leading-tight">{nowPlaying.name}</p>
            <p className="text-white/50 text-sm mt-1">com {nowPlaying.host}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Clock className="h-3 w-3 text-white/40" />
              <p className="text-white/40 text-xs">{nowPlaying.schedule}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Program Grid */}
      <div className="px-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
          Grade Completa
        </p>

        <div className="flex flex-col gap-3">
          {otherPrograms.map((program, i) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              className="flex gap-3 cursor-pointer group"
            >
              <div className="relative flex-shrink-0 w-[100px] h-[100px] rounded-2xl overflow-hidden">
                <img
                  src={program.thumb}
                  alt={program.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <p className="text-sm font-display font-bold text-foreground leading-tight">
                  {program.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">com {program.host}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground/60" />
                  <p className="text-[11px] text-muted-foreground/80">{program.schedule}</p>
                </div>
              </div>
              <div className="flex items-center flex-shrink-0">
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgramasTab;
