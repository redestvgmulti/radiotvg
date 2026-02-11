import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import LiveBadge from '@/components/LiveBadge';
import VideoPlayer from '@/components/VideoPlayer';
import logoRadio from '@/assets/logo-radio-tvg.png';

import thumbLiveCulto from '@/assets/thumb-live-culto.jpg';
import thumbManhaSertaneja from '@/assets/thumb-manha-sertaneja.jpg';
import thumbEntrevista from '@/assets/thumb-entrevista.jpg';
import thumbShowRaiz from '@/assets/thumb-show-raiz.jpg';
import thumbTopHits from '@/assets/thumb-top-hits.jpg';
import thumbGospelNight from '@/assets/thumb-gospel-night.jpg';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  isLive: boolean;
  views: string;
  duration: string;
  hlsSrc: string;
}

const mockVideos: Video[] = [
  { id: '1', title: 'Culto ao Vivo — Domingo', thumbnail: thumbLiveCulto, isLive: true, views: '2.3K', duration: '', hlsSrc: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: '2', title: 'Manhã Sertaneja', thumbnail: thumbManhaSertaneja, isLive: false, views: '890', duration: '1:32:00', hlsSrc: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: '3', title: 'Entrevista Especial', thumbnail: thumbEntrevista, isLive: false, views: '1.1K', duration: '45:20', hlsSrc: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: '4', title: 'Show Raiz — Gravado', thumbnail: thumbShowRaiz, isLive: false, views: '560', duration: '2:10:00', hlsSrc: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: '5', title: 'Top Hits da Semana', thumbnail: thumbTopHits, isLive: false, views: '3.4K', duration: '58:00', hlsSrc: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: '6', title: 'Gospel Night Session', thumbnail: thumbGospelNight, isLive: false, views: '2.1K', duration: '1:45:00', hlsSrc: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
];

const VideoTab = () => {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const liveVideos = mockVideos.filter((v) => v.isLive);
  const otherVideos = mockVideos.filter((v) => !v.isLive);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen pb-24"
      >
        {/* Minimal Header */}
        <header className="flex items-center justify-between px-5 pt-4 pb-2">
          <img src={logoRadio} alt="Rádio TVG" className="h-8 sm:h-9 md:h-10 w-auto object-contain" />
        </header>

        {/* Live Hero */}
        {liveVideos.map((video) => (
          <motion.div
            key={video.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveVideo(video)}
            className="relative mx-4 mb-5 rounded-3xl overflow-hidden cursor-pointer group shadow-[0_8px_60px_-12px_hsl(var(--live)/0.3)]"
          >
            <div className="aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Live badge */}
            <div className="absolute top-4 left-4">
              <LiveBadge />
            </div>

            {/* Play button center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center"
              >
                <Play className="h-7 w-7 text-white ml-0.5" />
              </motion.div>
            </div>

            {/* Info */}
            <div className="absolute bottom-0 inset-x-0 p-5">
              <p className="text-white text-lg font-display font-bold leading-tight">{video.title}</p>
              <p className="text-white/50 text-xs mt-1">{video.views} assistindo agora</p>
            </div>
          </motion.div>
        ))}

        {/* Library Section */}
        <div className="px-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
            Biblioteca
          </p>

          {/* Horizontal featured row */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-3 mb-4">
            {otherVideos.slice(0, 3).map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveVideo(video)}
                className="relative flex-shrink-0 w-[260px] rounded-2xl overflow-hidden cursor-pointer group"
              >
                <div className="aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play className="h-4 w-4 text-white ml-0.5" />
                  </div>
                </div>

                {/* Duration */}
                <span className="absolute top-2 right-2 text-[10px] font-medium bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                  {video.duration}
                </span>

                {/* Info */}
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2 drop-shadow-md">
                    {video.title}
                  </p>
                  <p className="text-white/40 text-[10px] mt-0.5">{video.views} views</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Vertical list for remaining */}
          <div className="flex flex-col gap-3">
            {otherVideos.slice(3).map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveVideo(video)}
                className="flex gap-3 cursor-pointer group"
              >
                <div className="relative flex-shrink-0 w-[160px] rounded-xl overflow-hidden">
                  <div className="aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="absolute bottom-1.5 right-1.5 text-[9px] font-medium bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">
                    {video.duration}
                  </span>
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                    {video.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{video.views} views</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Fullscreen HLS Player */}
      <AnimatePresence>
        {activeVideo && (
          <VideoPlayer
            src={activeVideo.hlsSrc}
            title={activeVideo.title}
            isLive={activeVideo.isLive}
            poster={activeVideo.thumbnail}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoTab;
