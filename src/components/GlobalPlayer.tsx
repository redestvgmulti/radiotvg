import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, Volume2 } from 'lucide-react';
import { useRadioStore } from '@/store/useRadioStore';
import { streams } from '@/data/streams';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import '@/style/GlobalPlayer.css';

export const GlobalPlayer = () => {
  const streamId = useRadioStore((state) => state.streamId);
  const isPlaying = useRadioStore((state) => state.isPlaying);
  const volume = useRadioStore((state) => state.volume);
  const muted = useRadioStore((state) => state.muted);
  const togglePlay = useRadioStore((state) => state.togglePlay);

  const stream = streams.find((item) => item.id === streamId);
  const audioRef = useRef<HTMLAudioElement>(null);

  useAudioPlayer({
    audioRef,
    src: stream?.url ?? '',
    isPlaying,
    volume,
    muted
  });

  const mode = useRadioStore((state) => state.mode);
  const programName = useRadioStore((state) => state.programName);
  const mainTitle = mode === 'PROGRAM_LIVE' ? programName : (stream?.name || 'Rádio TVG');

  return (
    <div className="global-player-container">
      <div className="global-player-panel">
        <div className="player-info">
          <div className="player-metadata">
            <div className="player-status">
              <span className="on-air-pulse" style={{ width: 8, height: 8 }} />
              AO VIVO
            </div>
            <h5 className="player-program">{mainTitle}</h5>
          </div>
        </div>

        <div className="player-controls">
          <button
            onClick={togglePlay}
            className="player-main-btn"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" style={{ marginLeft: 4 }} />
            )}
          </button>
        </div>

        <div className="player-secondary-controls">
          {isPlaying && (
            <div className="player-equalizer-mini" style={{ opacity: 0.8 }}>
              <motion.div animate={{ height: [4, 12, 6, 10, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="eq-bar" style={{ background: '#FFF' }} />
              <motion.div animate={{ height: [8, 4, 12, 6, 8] }} transition={{ repeat: Infinity, duration: 1.0 }} className="eq-bar" style={{ background: '#FFF' }} />
              <motion.div animate={{ height: [6, 10, 4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="eq-bar" style={{ background: '#FFF' }} />
            </div>
          )}
          <button className="player-btn">
            <Heart size={20} />
          </button>
          <div className="player-volume-control" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Volume2 size={20} opacity={0.8} />
            <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
              <div style={{ width: '70%', height: '100%', background: '#FFF', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

export default GlobalPlayer;
