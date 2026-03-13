import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Headphones, Loader2 } from 'lucide-react';
import { useRadioStore, StreamEnvironment } from '@/stores/useRadioStore';
import logoRadio from '@/assets/logo-radio-tvg-new.png';
import { supabase } from '@/integrations/supabase/client';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface Program {
  id: string; name: string; host: string; day_of_week: number;
  start_time: string; end_time: string; is_active: boolean; station_id: string | null;
}

const ProgramasTab = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStation, setFilterStation] = useState<string | null>(null);
  const { environments } = useRadioStore();

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data } = await supabase.from('programs').select('*').eq('is_active', true).order('day_of_week').order('start_time');
      setPrograms((data as Program[]) || []);
      setLoading(false);
    };
    fetchPrograms();
  }, []);

  const now = new Date();
  const currentDay = now.getDay();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const filtered = programs.filter(p => !filterStation || p.station_id === filterStation);
  const nowPlaying = filtered.find(
    p => p.day_of_week === currentDay && p.start_time.slice(0, 5) <= currentTimeStr && p.end_time.slice(0, 5) > currentTimeStr
  );

  // Group by day
  const byDay = filtered.reduce<Record<number, Program[]>>((acc, p) => {
    if (!acc[p.day_of_week]) acc[p.day_of_week] = [];
    acc[p.day_of_week].push(p);
    return acc;
  }, {});

  // Sort days starting from today
  const sortedDays = Array.from({ length: 7 }, (_, i) => (currentDay + i) % 7).filter(d => byDay[d]?.length);

  const getStationLabel = (id: string | null) => {
    if (!id) return null;
    return environments.find(e => e.id === id)?.label;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen pb-36">
      <header className="px-5 pt-5 pb-3">
        <div className="h-10 flex items-center">
          <img src={logoRadio} alt="Rádio TVG" className="h-full w-auto object-contain" />
        </div>
      </header>

      <div className="px-4 mb-4">
        <h1 className="text-lg font-display font-bold text-foreground mb-3">Programação</h1>

        {/* Station filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button onClick={() => setFilterStation(null)}
            className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${!filterStation ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
            Todas
          </button>
          {environments.map(env => (
            <button key={env.id} onClick={() => setFilterStation(env.id)}
              className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterStation === env.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {env.label}
            </button>
          ))}
        </div>
      </div>

      {/* Now Playing */}
      {nowPlaying && (
        <div className="px-4 mb-5">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] card-glow" style={{ minHeight: 120 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-accent/10" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Headphones className="h-3 w-3 text-primary-foreground" />
              <span className="text-[9px] font-bold text-primary-foreground uppercase tracking-wider">Ao Vivo</span>
            </div>
            <div className="relative p-4 pt-12">
              <p className="text-foreground text-lg font-display font-bold">{nowPlaying.name}</p>
              <p className="text-muted-foreground text-sm mt-0.5">com {nowPlaying.host}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-muted-foreground text-xs">{nowPlaying.start_time.slice(0, 5)} – {nowPlaying.end_time.slice(0, 5)}</p>
                {getStationLabel(nowPlaying.station_id) && (
                  <span className="text-[9px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">{getStationLabel(nowPlaying.station_id)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-xs text-muted-foreground">Nenhum programa encontrado.</p>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {sortedDays.map(day => (
            <div key={day}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">
                  {day === currentDay ? `Hoje · ${DAYS[day]}` : DAYS[day]}
                </h2>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <div className="space-y-1.5">
                {byDay[day].map((prog, i) => {
                  const isNow = prog.id === nowPlaying?.id;
                  return (
                    <motion.div key={prog.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${isNow ? 'bg-primary/5 border-primary/20' : 'bg-card/50 border-white/[0.04]'}`}>
                      <div className="flex flex-col items-center w-12 flex-shrink-0">
                        <span className="text-sm text-foreground font-bold">{prog.start_time.slice(0, 5)}</span>
                        <span className="text-[9px] text-muted-foreground">{prog.end_time.slice(0, 5)}</span>
                      </div>
                      <div className="w-px h-8 bg-border/30" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{prog.name}</p>
                          {isNow && <span className="w-2 h-2 rounded-full bg-live animate-pulse flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">com {prog.host}</p>
                      </div>
                      {getStationLabel(prog.station_id) && (
                        <span className="text-[8px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium flex-shrink-0">
                          {getStationLabel(prog.station_id)}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </motion.div>
  );
};

export default ProgramasTab;
