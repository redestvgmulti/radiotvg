'use client';

import { motion } from 'framer-motion';
import '@/style/SponsorsCarousel.css';

const sponsors = [
    { id: 1, name: 'Claro' },
    { id: 2, name: 'Coca-Cola' },
    { id: 3, name: 'Itaú' },
    { id: 4, name: 'Unimed' },
    { id: 5, name: 'Brahma' },
];

export const SponsorsCarousel = () => {
    return (
        <div className="sponsors-carousel-container">
            <div className="sponsors-carousel-scroll">
                {sponsors.map((sponsor) => (
                    <motion.div
                        key={sponsor.id}
                        whileHover={{ scale: 1.05 }}
                        className="sponsor-carousel-item"
                    >
                        <div className="sponsor-carousel-placeholder">
                            <span className="sponsor-carousel-text">{sponsor.name}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
