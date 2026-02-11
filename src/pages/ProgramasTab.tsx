import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Headphones, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoRadio from '@/assets/logo-radio-tvg.png';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface Program {
  id: string;
  name: string;
  host: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const ProgramasTab = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');
      setPrograms((data as Program[]) || []);
      setLoading(false);
    };
    fetchPrograms();
  }, []);

  // Determine "now playing" by comparing current day/time
  const now = new Date();
  const currentDay = now.getDay();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const nowPlaying = programs.find(
    (p) => p.day_of_week === currentDay && p.start_time.slice(0, 5) <= currentTimeStr && p.end_time.slice(0, 5) > currentTimeStr
  );

  const otherPrograms = programs.filter((p) => p.id !== nowPlaying?.id);

  const formatSchedule = (p: Program) => {
    return `${DAYS[p.day_of_week]} · ${p.start_time.slice(0, 5)}–${p.end_time.slice(0, 5)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="px-5 pt-5 pb-3">
          <div className="h-10 overflow-hidden flex items-center">
            <img src={logoRadio} alt="Rádio TVG" className="h-[200%] w-auto object-contain object-center" />
          </div>
        </header>
        <div className="px-4 space-y-3">
          <Skeleton className="h-[200px] rounded-3xl" />
          <Skeleton className="h-5 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-[100px] h-[100px] rounded-2xl" />
              <div className="flex-1 space-y-2 py-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen pb-24">
      <header className="px-5 pt-5 pb-3">
        <div className="h-10 sm:h-11 md:h-12 overflow-hidden flex items-center">
          <img src={logoRadio} alt="Rádio TVG" className="h-[200%] w-auto object-contain object-center" />
        </div>
      </header>

      {nowPlaying && (
        <motion.div whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/programas/${nowPlaying.id}`)}
          className="relative mx-4 mb-5 rounded-3xl overflow-hidden cursor-pointer group bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
          style={{ minHeight: 160 }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <Headphones className="h-3 w-3 text-primary-foreground" />
            <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider">No Ar</span>
          </div>
          <div className="relative p-5 pt-14">
            <p className="text-foreground text-xl font-display font-bold leading-tight">{nowPlaying.name}</p>
            <p className="text-muted-foreground text-sm mt-1">com {nowPlaying.host}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-muted-foreground text-xs">{formatSchedule(nowPlaying)}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="px-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
          Grade Completa
        </p>

        {programs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">Nenhum programa cadastrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {otherPrograms.map((program, i) => (
              <motion.div key={program.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/programas/${program.id}`)}
                className="flex gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 w-[100px] h-[100px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-primary/40" />
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <p className="text-sm font-display font-bold text-foreground leading-tight">{program.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">com {program.host}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground/60" />
                    <p className="text-[11px] text-muted-foreground/80">{formatSchedule(program)}</p>
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProgramasTab;
