import { motion } from 'framer-motion';

const LiveBadge = ({ className = '' }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-live/20 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
      </span>
      <span className="text-xs font-semibold tracking-wider text-live uppercase">Live</span>
    </motion.div>
  );
};

export default LiveBadge;
