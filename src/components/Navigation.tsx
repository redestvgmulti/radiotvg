'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, PlaySquare, User, Settings } from 'lucide-react';
import { useRadioStore } from '@/store/useRadioStore';
import { streams } from '@/data/streams';
import { fadeUp } from '@/motion/presets';
import '@/style/Navigation.css';

const navItems = [
    { label: 'Rádio', icon: LayoutGrid },
    { label: 'Vídeos', icon: PlaySquare },
    { label: 'Perfil', icon: User },
    { label: 'Config', icon: Settings }
];

export const Navigation = () => {
    const isSidebarOpen = useRadioStore((state) => state.isSidebarOpen);
    const setSidebarOpen = useRadioStore((state) => state.setSidebarOpen);
    const streamId = useRadioStore((state) => state.streamId);
    const activeView = useRadioStore((state) => state.activeView);
    const setActiveView = useRadioStore((state) => state.setActiveView);
    const stream = streams.find((item) => item.id === streamId);

    return (
        <>
            {/* Desktop Sidebar Navigation */}
            <aside className="nav-desktop-sidebar">
                <div className="navigation-logo-container">
                    <img src="/logo-rádio-tvg.png" alt="Rádio TVG" className="navigation-logo" />
                </div>

                <nav className="navigation-section">
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.label}
                            variants={fadeUp}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setActiveView(item.label)}
                            className={`navigation-item ${activeView === item.label ? 'navigation-item-active' : ''}`}
                        >
                            <item.icon size={22} strokeWidth={activeView === item.label ? 2.5 : 2} />
                            <span className="nav-desktop-item-label">{item.label}</span>
                        </motion.div>
                    ))}
                </nav>

                <div className="nav-desktop-footer">
                    <p className="nav-desktop-footer-label">Ouvindo Agora</p>
                    <div className="nav-desktop-stream-card">
                        <p className="nav-desktop-stream-name">{stream?.name}</p>
                        <p className="nav-desktop-stream-desc">{stream?.description}</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation (Not changed, assumed working) */}
            <nav className="nav-mobile-bottom">
                <div className="nav-mobile-gradient" />
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setActiveView(item.label)}
                        className="nav-mobile-button"
                    >
                        <item.icon
                            strokeWidth={activeView === item.label ? 2.5 : 2}
                            className={activeView === item.label ? 'nav-mobile-icon-active' : 'nav-mobile-icon-inactive'}
                        />
                        <span className={activeView === item.label ? 'nav-mobile-label-active' : 'nav-mobile-label-inactive'}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>
        </>
    );
};

export default Navigation;
