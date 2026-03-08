'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Play } from 'lucide-react';
import { useRadioStore } from '@/store/useRadioStore';
import '@/style/OnAirHighlight.css';

export const OnAirHighlight = () => {
    const { programName, isPlaying, togglePlay } = useRadioStore();

    // Placeholder host
    const speakerName = "Geovane Panini";

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="on-air-card"
        >
            <div className="on-air-info">
                <div className="on-air-status-wrapper">
                    <div className="on-air-pulse" />
                    <Radio className="on-air-icon" size={24} />
                </div>
                <div className="on-air-text">
                    <span className="on-air-label">No Ar Agora</span>
                    <h3 className="on-air-program">{programName}</h3>
                    <span className="on-air-speaker">{speakerName}</span>
                </div>
            </div>

            <button
                onClick={togglePlay}
                className="on-air-action"
            >
                <Play size={16} fill="currentColor" />
                {isPlaying ? 'Ouvindo...' : 'Ouvir Agora'}
            </button>
        </motion.div>
    );
};
