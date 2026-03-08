import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import '@/style/SponsorsFooter.css';

const sponsors = [
    { name: 'Claro', type: 'Patrocínio Premium', color: 'sponsor-logo-claro' },
    { name: 'Unimed', type: 'Parceiro Saúde', color: 'sponsor-logo-unimed' },
    { name: 'Coca-Cola', type: 'Patrocínio Oficial', color: 'sponsor-logo-coca' },
    { name: 'Itaú', type: 'Banco Oficial', color: 'sponsor-logo-itau' },
];

export const SponsorsFooter = () => {
    const tickerContent = [...sponsors, ...sponsors, ...sponsors];

    return (
        <div className="sponsors-container">
            <div className="sponsors-ticker-wrapper">
                <div className="sponsors-mask-left" />
                <div className="sponsors-mask-right" />

                <motion.div
                    className="sponsors-ticker"
                    animate={{ x: [0, -500] }}
                    transition={{
                        repeat: Infinity,
                        duration: 15,
                        ease: "linear",
                        repeatType: "loop"
                    }}
                >
                    {tickerContent.map((sponsor, index) => (
                        <div key={`${sponsor.name}-${index}`} className="sponsor-item">
                            <div className={`sponsor-logo ${sponsor.color}`}>
                                <span className="sponsor-logo-text">{sponsor.name}</span>
                            </div>
                            <div className="sponsor-info">
                                <p className="sponsor-type">{sponsor.type}</p>
                                <p className="sponsor-name">{sponsor.name}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="sponsors-icon-container">
                <Award className="sponsors-icon" />
            </div>
        </div>
    );
};
