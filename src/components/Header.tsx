'use client';

import { Search, Radio, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import '@/style/Header.css';

export const Header = () => {
    return (
        <header className="header-container">
            <div className="header-inner">
                <div className="md:hidden" /> {/* Spacer */}

                <div className="header-logo-section">
                    <h1 className="header-title">Rádio <span className="header-title-accent">TVG</span></h1>
                    <span className="header-subtitle">Complexo DBA Multiplace</span>
                </div>

                <button className="header-search-button">
                    <Search className="size-[28px]" />
                    <div className="header-search-dot"></div>
                </button>
            </div>
        </header>
    );
};
