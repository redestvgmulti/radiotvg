import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Radio, Loader2, Film } from 'lucide-react';
import LiveBadge from '@/components/LiveBadge';
import VideoPlayer from '@/components/VideoPlayer';
import PersistentPlayer from '@/components/PersistentPlayer';
import logoRadio from '@/assets/logo-radio-tvg.png';
import { supabase } from '@/integrations/supabase/client';
import { useRadioStore } from '@/stores/useRadioStore';

interface Video {
  id: string; title: string; thumbnail_url: string; hls_url: string;
  duration: string; views_count: number; is_active: boolean;
}

interface ActiveVideo {
  id: string; title: string; thumbnail: string; isLive: boolean; hlsSrc: string;
}

const formatViews = (n: number): string => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

const VideoTab = () => {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLive, setVideoActive } = useRadioStore();

  useEffect(() => {
    const fetchData = async () => {
      const [settingsRes, videosRes] = await Promise.all([
        supabase.from('radio_settings').select('key, value').eq('key', 'video_stream_url').maybeSingle(),
        supabase.from('videos').select('*').eq('is_active', true).order('sort_order'),
      ]);
      setLiveStreamUrl(settingsRes.data?.value || '');
      setVideos((videosRes.data as Video[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const openVideo = (video: ActiveVideo) => { setActiveVideo(video); setVideoActive(true); };
  const closeVideo = () => { setActiveVideo(null); setVideoActive(false); };

  const liveVideo: ActiveVideo | null = isLive && liveStreamUrl ? {
    id: 'live', title: 'Transmissão ao Vivo', thumbnail: '', isLive: true, hlsSrc: liveStreamUrl,
  } : null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen pb-36">
        <header className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="h-9 overflow-hidden flex items-center">
            <img src={logoRadio} alt="Rádio TVG" className="h-[200%] w-auto object-contain object-center brightness-0 invert" />
          </div>
        </header>

        {liveVideo && (
          <motion.div whileTap={{ scale: 0.98 }} onClick={() => openVideo(liveVideo)}
            className="relative mx-4 mb-5 rounded-2xl overflow-hidden cursor-pointer group shadow-[0_8px_40px_-12px_hsl(var(--live)/0.3)] border border-white/[0.06]">
            <div className="aspect-video bg-gradient-to-br from-live/10 to-card">
              <div className="absolute inset-0 flex items-center justify-center">
                <Radio className="h-12 w-12 text-live/20" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4"><LiveBadge /></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur-xl border border-white/[0.1] flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                <Play className="h-7 w-7 text-primary-foreground ml-0.5" />
              </motion.div>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-5">
              <p className="text-white text-lg font-display font-bold leading-tight">{liveVideo.title}</p>
              <p className="text-white/50 text-xs mt-1">Assistindo agora</p>
            </div>
          </motion.div>
        )}

        {!liveVideo && !loading && (
          <div className="mx-4 mb-5 rounded-2xl border border-white/[0.06] bg-card p-6 text-center">
            <Radio className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma transmissão ao vivo no momento</p>
          </div>
        )}

        <div className="px-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">Biblioteca</p>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8">
              <Film className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum vídeo disponível.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-3 mb-4 md:grid md:grid-cols-3 md:overflow-x-visible">
                {videos.slice(0, 3).map((video, i) => (
                  <motion.div key={video.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }} whileTap={{ scale: 0.97 }}
                    onClick={() => openVideo({ id: video.id, title: video.title, thumbnail: video.thumbnail_url, isLive: false, hlsSrc: video.hls_url || '' })}
                    className="relative flex-shrink-0 w-[260px] md:w-full rounded-2xl overflow-hidden cursor-pointer group border border-white/[0.04]">
                    <div className="aspect-video bg-card">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Film className="h-8 w-8 text-muted-foreground/20" /></div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-10 h-10 rounded-full bg-primary/80 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    {video.duration && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-full">{video.duration}</span>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{video.title}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">{formatViews(video.views_count || 0)} views</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                {videos.slice(3).map((video, i) => (
                  <motion.div key={video.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }} whileTap={{ scale: 0.98 }}
                    onClick={() => openVideo({ id: video.id, title: video.title, thumbnail: video.thumbnail_url, isLive: false, hlsSrc: video.hls_url || '' })}
                    className="flex gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0 w-[160px] rounded-xl overflow-hidden bg-card border border-white/[0.04]">
                      <div className="aspect-video">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center"><Film className="h-5 w-5 text-muted-foreground/20" /></div>
                        )}
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded-full">{video.duration}</span>
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{video.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{formatViews(video.views_count || 0)} views</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        <PersistentPlayer />
      </motion.div>

      <AnimatePresence>
        {activeVideo && (
          <VideoPlayer src={activeVideo.hlsSrc} title={activeVideo.title} isLive={activeVideo.isLive} poster={activeVideo.thumbnail} onClose={closeVideo} />
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoTab;
