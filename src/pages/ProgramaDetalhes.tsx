import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Clock, Headphones, Film, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/VideoPlayer';

interface Program {
  id: string;
  name: string;
  host: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface GalleryItem {
  id: string;
  title: string;
  thumbnail_url: string | null;
  media_url: string | null;
  media_type: string;
  duration: string | null;
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const ProgramaDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [progRes, galRes] = await Promise.all([
        supabase.from('programs').select('*').eq('id', id).maybeSingle(),
        supabase.from('program_gallery').select('*').eq('program_id', id).eq('is_active', true).order('sort_order'),
      ]);
      setProgram(progRes.data as Program | null);
      setGallery((galRes.data as GalleryItem[]) || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen pb-24">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate('/programas')} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="text-sm text-muted-foreground">Programa não encontrado</p>
        </div>
      </div>
    );
  }

  const schedule = `${DAYS[program.day_of_week]} · ${program.start_time.slice(0, 5)}–${program.end_time.slice(0, 5)}`;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24">
        {/* Header */}
        <div className="relative px-4 pt-4 pb-6">
          <button onClick={() => navigate('/programas')} className="h-8 w-8 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border flex items-center justify-center">
              <Headphones className="h-8 w-8 text-primary/50" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-foreground leading-tight">{program.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">com {program.host}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="h-3 w-3 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground">{schedule}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="px-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
            Galeria · {gallery.length} {gallery.length === 1 ? 'item' : 'itens'}
          </p>

          {gallery.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <Film className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum conteúdo na galeria deste programa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (item.media_url && item.media_type === 'video') {
                      setActiveVideo({ src: item.media_url, title: item.title });
                    }
                  }}
                  className="relative rounded-xl overflow-hidden cursor-pointer group"
                >
                  <div className="aspect-video bg-muted/30">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-6 w-6 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {item.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Play className="h-4 w-4 text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  {item.duration && (
                    <span className="absolute top-2 right-2 text-[9px] font-medium bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">{item.duration}</span>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-2.5">
                    <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 drop-shadow-md">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {activeVideo && (
          <VideoPlayer src={activeVideo.src} title={activeVideo.title} isLive={false} poster="" onClose={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProgramaDetalhes;
