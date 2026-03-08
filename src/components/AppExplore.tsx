'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, Tv, PlayCircle, Calendar, Mic2 } from 'lucide-react';
import { useRadioStore } from '@/store/useRadioStore';
import '@/style/AppExplore.css';

const exploreItems = [
    { label: 'Música ao Vivo', icon: Headphones, view: 'Rádio' },
    { label: 'TV ao Vivo', icon: Tv, view: 'TV' },
    { label: 'Vídeos', icon: PlayCircle, view: 'Vídeos' },
    { label: 'Programação', icon: Calendar, view: 'Programação' },
    { label: 'Locutores', icon: Mic2, view: 'Locutores' },
];

export const AppExplore = () => {
    const setActiveView = useRadioStore((state) => state.setActiveView);

    return (
        <section className="app-explore">
            <div className="app-explore-grid">
                {exploreItems.map((item, index) => (
                    <motion.button
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveView(item.view)}
                        className="app-explore-card"
                    >
                        <div className="app-explore-icon-wrapper">
                            <item.icon size={24} />
                        </div>
                        <span className="app-explore-label">{item.label}</span>
                    </motion.button>
                ))}
            </div>
        </section>
    );
};
