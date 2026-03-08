'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import '@/style/ProgramSchedule.css';

const schedule = [
    { time: '08:00', name: 'Manhã Multi', days: 'Seg - Sex', live: true },
    { time: '10:00', name: 'Giro de Notícias', days: 'Seg - Sex', live: false },
    { time: '12:00', name: 'Almoço com Música', days: 'Seg - Sex', live: false },
    { time: '14:00', name: 'Tarde Show', days: 'Seg - Sex', live: false },
    { time: '16:00', name: 'Flow Sessions', days: 'Seg - Sab', live: false },
];

export const ProgramSchedule = () => {
    return (
        <section className="program-schedule">
            <div className="section-header">
                <Calendar className="text-primary" size={20} />
                <h2 className="section-title">Próximos Programas</h2>
            </div>

            <div className="schedule-list">
                {schedule.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className={`schedule-item ${item.live ? 'schedule-item-live' : ''}`}
                    >
                        <span className="schedule-time">{item.time}</span>
                        <div className="schedule-info">
                            <span className="schedule-name">{item.name}</span>
                            <span className="schedule-days">{item.days}</span>
                        </div>
                        <div className="schedule-indicator" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
