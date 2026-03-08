'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, MessageCircle } from 'lucide-react';
import { useRadioStore } from '@/store/useRadioStore';
import { Equalizer } from '@/components/Equalizer';
import '@/style/HeroLive.css';

export const HeroLive = () => {
    const { isPlaying, togglePlay, programName } = useRadioStore();

    // Placeholder for host name - could be from store in the future
    const hostName = "Geovane Panini";

    return (
        <section className="hero-live">
            <div className="hero-live-bg" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="hero-live-badge"
            >
                <div className="hero-live-badge-dot" />
                AO VIVO AGORA
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="hero-live-program"
            >
                {programName}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="hero-live-host"
            >
                com {hostName}
            </motion.p>

            <div className="hero-live-controls">
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="hero-live-play-btn"
                >
                    {isPlaying ? (
                        <Pause size={48} fill="currentColor" />
                    ) : (
                        <Play size={48} fill="currentColor" className="ml-1.5" />
                    )}
                </motion.button>

                <div className="hero-live-equalizer">
                    <Equalizer active={isPlaying} />
                </div>

                <motion.a
                    href="https://wa.me/55000000000" // Placeholder phone
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="hero-live-whatsapp"
                >
                    <MessageCircle size={20} />
                    Participar no WhatsApp
                </motion.a>
            </div>
        </section>
    );
};
