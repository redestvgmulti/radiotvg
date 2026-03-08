'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Radio, Music } from 'lucide-react';
import { useRadioStore } from '@/store/useRadioStore';
import { streams } from '@/data/streams';
import { sponsors } from '@/data/sponsors';
import '@/style/HeroCard.css';

export const HeroCard = () => {
    const mode = useRadioStore((state) => state.mode);
    const isPlaying = useRadioStore((state) => state.isPlaying);
    const togglePlay = useRadioStore((state) => state.togglePlay);
    const streamId = useRadioStore((state) => state.streamId);
    const programName = useRadioStore((state) => state.programName);
    const videoUrl = useRadioStore((state) => state.videoUrl);
    const volume = useRadioStore((state) => state.volume);
    const setVolume = useRadioStore((state) => state.setVolume);
    const toggleStyleSelector = useRadioStore((state) => state.toggleStyleSelector);

    const currentStream = streams.find(s => s.id === streamId);
    const isLive = mode === 'PROGRAM_LIVE';

    const [videoMuted, setVideoMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const effectiveSponsors = sponsors;
    const [currentSponsorIndex, setCurrentSponsorIndex] = useState(-1);
    const [showingSponsor, setShowingSponsor] = useState(false);

    useEffect(() => {
        if (effectiveSponsors.length === 0) return;

        const STREAM_DURATION = 15000;
        const SPONSOR_MIN_DURATION = 10000;

        let timer: NodeJS.Timeout;

        const rotate = () => {
            if (showingSponsor) {
                setShowingSponsor(false);
                timer = setTimeout(rotate, STREAM_DURATION);
            } else {
                const nextIndex = (currentSponsorIndex + 1) % effectiveSponsors.length;
                setCurrentSponsorIndex(nextIndex);
                setShowingSponsor(true);

                const sponsorDuration = (effectiveSponsors[nextIndex].duration || 10) * 1000;
                timer = setTimeout(rotate, sponsorDuration);
            }
        };

        timer = setTimeout(rotate, STREAM_DURATION);

        return () => clearTimeout(timer);
    }, [showingSponsor, currentSponsorIndex, effectiveSponsors.length]);

    useEffect(() => {
        if (!isPlaying && !isLive) {
            togglePlay();
        }
    }, []);

    useEffect(() => {
        if (isLive) {
            if (isPlaying) togglePlay();
            if (videoRef.current) {
                videoRef.current.play().catch(e => console.log('Autoplay blocked', e));
            }
        }
    }, [isLive]);

    const handleCardClick = () => {
        if (isLive) {
            setVideoMuted(!videoMuted);
        } else {
            togglePlay();
        }
    };

    const activeTitle = isLive ? "AO VIVO AGORA" : currentStream?.name;
    const activeSubtitle = isLive ? programName : currentStream?.description;
    const activeCover = isLive
        ? "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=800&auto=format&fit=crop&q=80"
        : (currentStream?.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80");

    const displaySponsor = !isLive && showingSponsor && effectiveSponsors.length > 0;
    const currentSponsor = effectiveSponsors[currentSponsorIndex];

    return (
        <motion.div
            className="hero-card-container"
            onClick={handleCardClick}
            whileTap={{ scale: 0.98 }}
        >
            {/* Base Layer: Stream Cover */}
            <AnimatePresence mode="wait">
                {(!isLive && !displaySponsor) && (
                    <motion.div
                        key="stream-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="hero-card-stream-cover"
                        style={{ backgroundImage: `url('${activeCover}')` }}
                    />
                )}
            </AnimatePresence>

            {/* Sponsor Layer */}
            <AnimatePresence mode="wait">
                {displaySponsor && currentSponsor && (
                    <motion.div
                        key={`sponsor-${currentSponsor.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="hero-card-sponsor-container"
                    >
                        {currentSponsor.mediaType === 'video' ? (
                            <video
                                src={currentSponsor.url}
                                className="hero-card-sponsor-video"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <div
                                className="hero-card-sponsor-image"
                                style={{ backgroundImage: `url('${currentSponsor.url}')` }}
                            />
                        )}
                        <div className="hero-card-sponsor-badge">
                            <p className="hero-card-sponsor-badge-text">Patrocinador</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Video Layer */}
            <AnimatePresence>
                {isLive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hero-card-live-container"
                    >
                        {videoUrl ? (
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                className="hero-card-live-video"
                                autoPlay
                                muted={videoMuted}
                                playsInline
                                loop
                            />
                        ) : (
                            <div className="hero-card-live-fallback" style={{ backgroundImage: `url('${activeCover}')` }}>
                                <div className="hero-card-live-fallback-overlay">
                                    <div className="hero-card-live-loading">SINAL AO VIVO RECUPERANDO...</div>
                                </div>
                            </div>
                        )}
                        {videoMuted && (
                            <div className="hero-card-mute-icon">
                                <VolumeX className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UI Overlays */}
            <div className={`hero-card-gradient ${displaySponsor ? 'hero-card-gradient-hidden' : ''}`} />

            <div className={`hero-card-content ${displaySponsor ? 'hero-card-content-hidden' : ''}`}>
                <div className="hero-card-controls">
                    {/* Titles */}
                    <div className="hero-card-titles">
                        <motion.div
                            key={isLive ? 'live-title' : streamId}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            {isLive ? (
                                <div className="hero-card-live-badge-container">
                                    <div className="hero-card-live-badge">
                                        <span className="hero-card-live-dot" />
                                        AO VIVO
                                    </div>
                                    {programName && (
                                        <h3 className="hero-card-program-title">
                                            {programName}
                                        </h3>
                                    )}
                                </div>
                            ) : (
                                <h3 className="hero-card-stream-title">
                                    {currentStream?.name?.toUpperCase() || 'RÁDIO TVG'}
                                </h3>
                            )}
                        </motion.div>

                        {/* Subtitle / Marquee */}
                        <div className="hero-card-marquee-container">
                            {isLive ? (
                                <motion.p
                                    className="hero-card-live-subtitle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    AO VIVO
                                </motion.p>
                            ) : (
                                <div className="hero-card-marquee">
                                    <motion.div
                                        className="hero-card-marquee-text"
                                        animate={{ x: ["0%", "-100%"] }}
                                        transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
                                    >
                                        Tocando agora: Batida Neon.  •  Tocando agora: Batida Neon.  •  Tocando agora: Batida Neon.
                                    </motion.div>
                                    <motion.div
                                        className="hero-card-marquee-text"
                                        animate={{ x: ["0%", "-100%"] }}
                                        transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
                                    >
                                        Tocando agora: Batida Neon.  •  Tocando agora: Batida Neon.  •  Tocando agora: Batida Neon.
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="hero-card-button-row">
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="hero-card-play-button"
                        >
                            {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} className="ml-1" />}
                        </button>

                        <div className="hero-card-volume-container">
                            <button onClick={() => setVolume(0)} className="hero-card-volume-button">
                                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="hero-card-volume-slider"
                            />
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleStyleSelector();
                            }}
                            className="hero-card-style-button"
                        >
                            <Music size={20} />
                            <span className="hero-card-style-button-label">Estilo</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
