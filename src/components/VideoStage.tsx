'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Hls from 'hls.js';
import { transitions } from '@/motion/presets';
import '@/style/VideoStage.css';

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
      className="video-stage-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.98 }}
      transition={transitions.medium}
    >
      <video
        ref={videoRef}
        className="video-stage-player"
        playsInline
        muted
        autoPlay
      />
      <div className="video-stage-gradient" />
      <div className="video-stage-border" />
    </motion.div>
  );
};
