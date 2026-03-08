'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { SponsorsFooter } from '@/components/SponsorsFooter';
import { useRadioStore } from '@/store/useRadioStore';
import { streams } from '@/data/streams';
import '@/style/RadioMain.css';

export const RadioMain = () => {
    const { streamId, setStream, isPlaying, togglePlay } = useRadioStore();

    const activeStream = streams.find(s => s.id === streamId) || streams[0];

    return (
        <div className="radio-main-container">

            {/* LEFT COLUMN: Artwork (Desktop) / Top (Mobile) */}
            <div className="radio-artwork-column">
                {/* Artwork / Radio Card */}
                <div className="radio-artwork-card">
                    {/* Animated Artwork */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStream?.id}
                            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="radio-artwork-image-wrapper"
                        >
                            <img
                                src={activeStream?.cover}
                                alt={activeStream?.name}
                                className="radio-artwork-image"
                            />
                            {/* Gradient Overlay based on theme */}
                            <div className={`radio-artwork-gradient ${activeStream?.theme?.gradient || ''}`} />

                            {/* Live Indicator inside Art */}
                            {isPlaying && (
                                <div className="radio-live-indicator">
                                    <span className="radio-live-dot" />
                                    AO VIVO
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* RIGHT COLUMN: Controls & Info (Desktop) / Bottom (Mobile) */}
            <div className="radio-controls-column">

                {/* Genre Navigation (Tabs) */}
                <nav className="radio-genre-nav">
                    {streams.map((stream) => {
                        const isActive = streamId === stream.id;
                        return (
                            <button
                                key={stream.id}
                                onClick={() => setStream(stream.id)}
                                className={`radio-genre-button ${isActive ? 'radio-genre-button-active' : 'radio-genre-button-inactive'}`}
                            >
                                {stream.name}
                            </button>
                        )
                    })}
                </nav>

                {/* Metadata - Logo */}
                <div className="radio-logo-container">
                    <motion.img
                        key={activeStream?.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        src="/logo-rádio-tvg.png"
                        alt="Rádio TVG - Complexo DBA Multiplace"
                        className="radio-logo"
                    />
                </div>

                {/* Player Controls */}
                <div className="radio-player-controls">
                    <button className="radio-control-button">
                        <SkipBack size={32} fill="currentColor" strokeWidth={0} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="radio-play-button"
                    >
                        {/* Ensure icon stays centered visually */}
                        {isPlaying ? (
                            <Pause size={36} fill="currentColor" className="relative" />
                        ) : (
                            <Play size={36} fill="currentColor" className="relative ml-1.5" />
                        )}
                    </button>

                    <button className="radio-control-button">
                        <SkipForward size={32} fill="currentColor" strokeWidth={0} />
                    </button>
                </div>

                {/* Sponsors Ticker */}
                <div className="radio-sponsors-container">
                    <SponsorsFooter />
                </div>

            </div>
        </div>
    );
};

