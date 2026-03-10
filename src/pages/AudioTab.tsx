import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Headphones, Calendar, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LiveBadge from '@/components/LiveBadge';
import EnvironmentSelector from '@/components/EnvironmentSelector';
import AdDisplay from '@/components/AdDisplay';
import { useRadioStore } from '@/stores/useRadioStore';
import { supabase } from '@/integrations/supabase/client';
import logoRadio from '@/assets/logo-radio-tvg.png';

import envSertanejo from '@/assets/env-sertanejo.jpg';
import envPoprock from '@/assets/env-poprock.jpg';
import envRaiz from '@/assets/env-raiz.jpg';
import envGospel from '@/assets/env-gospel.jpg';

const localImageMap: Record<string, string> = {
  aovivo: envSertanejo, sertanejo: envSertanejo, poprock: envPoprock, raiz: envRaiz, gospel: envGospel,
};

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface Program {
  id: string; name: string; host: string; day_of_week: number;
  start_time: string; end_time: string; is_active: boolean; station_id: string | null;
}

const AudioTab = () => {
  const {
    isPlaying, togglePlay, isLive,
    getCurrentEnvironment, getCurrentStreamUrl,
    isBuffering,
  } = useRadioStore();

  const env = getCurrentEnvironment();
  const streamUrl = getCurrentStreamUrl();
  const imgSrc = env?.image_url || localImageMap[env?.slug || 'aovivo'] || localImageMap.aovivo;
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('programs').select('*').eq('is_active', true).order('day_of_week').order('start_time');
      setPrograms((data as Program[]) || []);
    };
    load();
  }, []);

  // Current program filtered by station
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const nowPlaying = useMemo(() => {
    return programs.find(p => {
      const timeMatch = p.day_of_week === currentDay && p.start_time.slice(0, 5) <= currentTime && p.end_time.slice(0, 5) > currentTime;
      if (!timeMatch) return false;
      // If program has station_id, match with current env
      if (p.station_id && env) return p.station_id === env.id;
      return true; // No station filter = plays on all
    });
  }, [programs, currentDay, currentTime, env]);

  // Next programs
  const upcoming = useMemo(() => {
    const sorted = [...programs]
      .filter(p => !p.station_id || (env && p.station_id === env.id))
      .sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
        return a.start_time.localeCompare(b.start_time);
      });
    const idx = sorted.findIndex(p => p.id === nowPlaying?.id);
    const after = idx >= 0 ? sorted.slice(idx + 1) : sorted;
    return after.slice(0, 4);
  }, [programs, nowPlaying, env]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-36"
    >
      {/* ===== HERO ===== */}
      <section className="relative bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0">
          <img src={imgSrc} alt="" className="w-full h-full object-cover opacity-20 blur-sm scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative z-10 px-5 pt-5 pb-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="h-10 flex items-center">
              <img src={logoRadio} alt="Rádio TVG" className="h-full w-auto object-contain" />
            </div>
            {isLive && <LiveBadge />}
          </header>

          {/* Hero content */}
          <div className="flex flex-col items-center text-center">
            {isLive && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <LiveBadge size="large" />
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground leading-tight mb-1"
            >
              {nowPlaying?.name || env?.label || 'Rádio TVG'}
            </motion.h1>

            {nowPlaying && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-sm mb-1">
                com <span className="text-foreground/80 font-medium">{nowPlaying.host}</span>
              </motion.p>
            )}

            <p className="text-muted-foreground text-xs mb-6">
              {env?.description || 'Transmissão Contínua'}
            </p>

            {/* Play button + equalizer */}
            <div className="flex items-center gap-5 mb-6">
              <div className="flex items-end gap-[2px] h-8 opacity-60">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div key={`l-${i}`} className="w-[2.5px] rounded-full bg-primary"
                    animate={{ height: isPlaying ? [3, 12 + Math.random() * 16, 6, 18 + Math.random() * 10, 3] : 3 }}
                    transition={{ duration: 1.1 + Math.random() * 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.06 }} />
                ))}
              </div>

              <motion.button whileTap={{ scale: 0.9 }} onClick={togglePlay} disabled={!streamUrl}
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.5)] transition-all duration-300 disabled:opacity-40 disabled:shadow-none">
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
              </motion.button>

              <div className="flex items-end gap-[2px] h-8 opacity-60">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div key={`r-${i}`} className="w-[2.5px] rounded-full bg-accent"
                    animate={{ height: isPlaying ? [3, 14 + Math.random() * 14, 5, 20 + Math.random() * 8, 3] : 3 }}
                    transition={{ duration: 1.3 + Math.random() * 0.4, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }} />
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <motion.a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary border border-white/[0.06] text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              <MessageCircle className="h-4 w-4 text-accent" /> Participar no WhatsApp
            </motion.a>

            {isBuffering && isPlaying && (
              <p className="text-accent text-[10px] mt-3 animate-pulse">Carregando stream...</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== AMBIENTES / STATION SELECTOR (oculto — canal único por enquanto) ===== */}
      {/* <section className="px-4 mt-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">Estações</h2>
        <EnvironmentSelector />
      </section> */}

      {/* ===== ANÚNCIOS ===== */}
      <section className="px-4 mt-6">
        <AdDisplay />
      </section>

      {/* ===== NO AR AGORA ===== */}
      {nowPlaying && (
        <section className="px-4 mt-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">Ao Vivo Agora</h2>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-white/[0.06] card-glow">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-foreground font-display font-bold text-base truncate">{nowPlaying.name}</p>
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-live animate-pulse" />
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">com {nowPlaying.host}</p>
              <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                {nowPlaying.start_time.slice(0, 5)} – {nowPlaying.end_time.slice(0, 5)}
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={togglePlay} disabled={!streamUrl}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)] disabled:opacity-40">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </motion.button>
          </motion.div>
        </section>
      )}

      {/* ===== PRÓXIMOS PROGRAMAS ===== */}
      {upcoming.length > 0 && (
        <section className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Próximos</h2>
            <button onClick={() => navigate('/programas')} className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
              Ver todos <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {upcoming.map((prog, i) => (
              <motion.div key={prog.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-white/[0.04] hover:bg-card/80 transition-colors">
                <div className="flex flex-col items-center w-12 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground font-medium">{DAYS[prog.day_of_week].slice(0, 3)}</span>
                  <span className="text-sm text-foreground font-bold">{prog.start_time.slice(0, 5)}</span>
                </div>
                <div className="w-px h-8 bg-border/50" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold truncate">{prog.name}</p>
                  <p className="text-muted-foreground text-[11px]">com {prog.host}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

    </motion.div>
  );
};

export default AudioTab;
