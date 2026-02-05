'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Hls from 'hls.js';
import { transitions } from '@/motion/presets';

interface VideoStageProps {
  videoUrl?: string;
  active: boolean;
}

export const VideoStage = ({ videoUrl, active }: VideoStageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!active || !videoUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }

    video.src = videoUrl;
  }, [videoUrl, active]);

  return (
    <motion.div
      className="relative h-full w-full overflow-hidden rounded-[32px] border border-white/10 bg-black/40 shadow-2xl"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.98 }}
      transition={transitions.medium}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-0 border border-white/10" />
    </motion.div>
  );
};
