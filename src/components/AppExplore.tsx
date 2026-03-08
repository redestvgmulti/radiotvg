'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, Tv, PlayCircle, Calendar, Mic2 } from 'lucide-react';
import { useRadioStore } from '@/store/useRadioStore';
import '@/style/AppExplore.css';

const musicalEnvironments = [
    { label: 'Sertanejo', icon: Headphones, color: '#f59e0b', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop' },
    { label: 'Pop/Rock', icon: Headphones, color: '#3b82f6', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=800&auto=format&fit=crop' },
    { label: 'Gospel', icon: Headphones, color: '#10b981', image: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=800&auto=format&fit=crop' },
    { label: 'Raiz', icon: Headphones, color: '#78350f', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop' },
];

export const AppExplore = () => {
    const setActiveView = useRadioStore((state) => state.setActiveView);
    const setStream = useRadioStore((state) => state.setStream);

    return (
        <section className="app-explore">
            <div className="section-header">
                <h2 className="section-title">Ambientes Musicais</h2>
            </div>
            <div className="app-explore-grid">
                {musicalEnvironments.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -8 }}
                        onClick={() => {
                            // Aqui depois conectamos a troca de stream real
                            setActiveView('Rádio');
                        }}
                        className="music-env-card"
                        style={{ '--accent-color': item.color } as any}
                    >
                        <div className="music-env-image-container">
                            <img src={item.image} alt={item.label} className="music-env-image" />
                            <div className="music-env-overlay" />
                        </div>
                        <div className="music-env-content">
                            <div className="music-env-icon-bg">
                                <item.icon size={20} />
                            </div>
                            <span className="music-env-label">{item.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
