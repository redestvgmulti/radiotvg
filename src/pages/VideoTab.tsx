import { motion } from 'framer-motion';
import { Tv, Play } from 'lucide-react';
import LiveBadge from '@/components/LiveBadge';

const mockVideos = [
  { id: '1', title: 'Culto ao Vivo - Domingo', thumbnail: '', isLive: true, views: '2.3K', duration: '' },
  { id: '2', title: 'Programa Manhã Sertaneja', thumbnail: '', isLive: false, views: '890', duration: '1:32:00' },
  { id: '3', title: 'Entrevista Especial', thumbnail: '', isLive: false, views: '1.1K', duration: '45:20' },
  { id: '4', title: 'Show Raiz - Gravado', thumbnail: '', isLive: false, views: '560', duration: '2:10:00' },
  { id: '5', title: 'Top Hits da Semana', thumbnail: '', isLive: false, views: '3.4K', duration: '58:00' },
  { id: '6', title: 'Gospel Night Session', thumbnail: '', isLive: false, views: '2.1K', duration: '1:45:00' },
];

const VideoTab = () => {
  const liveVideos = mockVideos.filter((v) => v.isLive);
  const otherVideos = mockVideos.filter((v) => !v.isLive);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 px-4 pt-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Tv className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Vídeo</h1>
          <p className="text-xs text-muted-foreground">Biblioteca e transmissões</p>
        </div>
      </div>

      {/* Live section */}
      {liveVideos.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Ao Vivo Agora
          </p>
          {liveVideos.map((video) => (
            <motion.div
              key={video.id}
              whileTap={{ scale: 0.98 }}
              className="glass rounded-2xl overflow-hidden mb-3 cursor-pointer group"
            >
              <div className="relative aspect-video bg-muted/50 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <Play className="h-12 w-12 text-foreground/50 group-hover:text-primary transition-colors" />
                <div className="absolute top-3 left-3">
                  <LiveBadge />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-sm font-semibold text-foreground">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{video.views} assistindo</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video grid */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Biblioteca
      </p>
      <div className="grid grid-cols-2 gap-3">
        {otherVideos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-subtle rounded-xl overflow-hidden cursor-pointer group"
          >
            <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
              <Play className="h-8 w-8 text-foreground/30 group-hover:text-primary transition-colors" />
              <span className="absolute bottom-1.5 right-1.5 text-[10px] font-medium bg-background/80 text-foreground px-1.5 py-0.5 rounded">
                {video.duration}
              </span>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                {video.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{video.views} views</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default VideoTab;
