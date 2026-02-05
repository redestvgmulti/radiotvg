'use client';

import { motion } from 'framer-motion';

export const Equalizer = ({ active }: { active: boolean }) => {
  const bars = new Array(5).fill(0);

  return (
    <div className="flex items-end gap-1">
      {bars.map((_, index) => (
        <motion.span
          key={index}
          className="h-5 w-1 rounded-full bg-accent-cyan/80"
          animate={{
            opacity: active ? 1 : 0.3,
            scaleY: active ? [0.4, 1, 0.6] : 0.2
          }}
          transition={{
            duration: 1.2,
            repeat: active ? Infinity : 0,
            repeatType: 'mirror',
            delay: index * 0.12
          }}
        />
      ))}
    </div>
  );
};
