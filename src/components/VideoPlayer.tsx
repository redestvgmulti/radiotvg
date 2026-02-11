import { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import LiveBadge from '@/components/LiveBadge';

interface VideoPlayerProps {
  src: string;
  title: string;
  isLive?: boolean;
  poster?: string;
  onClose: () => void;
}

const VideoPlayer = ({ src, title, isLive = false, poster, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Init HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: isLive });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().then(() => setPlaying(true)).catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().then(() => setPlaying(true)).catch(() => {});
      });
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src, isLive]);

  // Time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
    };
    video.addEventListener('timeupdate', onTime);
    return () => video.removeEventListener('timeupdate', onTime);
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [playing, resetHideTimer]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true));
    } else {
      video.pause();
      setPlaying(false);
    }
    resetHideTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration || isLive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Video container */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center bg-black"
        onClick={resetHideTimer}
      >
        <div className="relative w-full max-w-4xl aspect-video">
          <video
            ref={videoRef}
            poster={poster}
            playsInline
            className="w-full h-full object-contain bg-black"
          />

          {/* Loading spinner */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Controls overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50"
              >
                {/* Top bar */}
                <div className="absolute top-0 inset-x-0 flex items-center gap-3 p-4">
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 text-white" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{title}</p>
                  </div>
                  {isLive && <LiveBadge />}
                </div>

                {/* Center play/pause */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center"
                  >
                    {playing ? (
                      <Pause className="h-7 w-7 text-white" />
                    ) : (
                      <Play className="h-7 w-7 text-white ml-0.5" />
                    )}
                  </motion.button>
                </div>

                {/* Bottom bar */}
                <div className="absolute bottom-0 inset-x-0 p-4 space-y-2">
                  {/* Progress bar */}
                  {!isLive && (
                    <div
                      className="w-full h-1 bg-white/20 rounded-full cursor-pointer group"
                      onClick={seek}
                    >
                      <div
                        className="h-full bg-primary rounded-full relative transition-all"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {!isLive && (
                      <span className="text-white/60 text-[11px] font-medium tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    )}
                    {isLive && <span />}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                      >
                        {muted ? (
                          <VolumeX className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5 text-white" />
                        )}
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                      >
                        {isFullscreen ? (
                          <Minimize className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Maximize className="h-3.5 w-3.5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
