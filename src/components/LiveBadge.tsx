import { motion } from 'framer-motion';

const LiveBadge = ({ className = '', size = 'default' }: { className?: string; size?: 'default' | 'large' }) => {
  const isLarge = size === 'large';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-live/20 border border-live/30 ${className}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-live shadow-[0_0_8px_hsl(var(--live)/0.6)]" />
      </span>
      <span className={`font-bold tracking-wider text-live uppercase ${isLarge ? 'text-sm' : 'text-xs'}`}>
        AO VIVO
      </span>
    </motion.div>
  );
};

export default LiveBadge;
