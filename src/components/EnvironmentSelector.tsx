import { useRadioStore, getEnvColorVar } from '@/stores/useRadioStore';
import { motion } from 'framer-motion';

import envSertanejo from '@/assets/env-sertanejo.jpg';
import envPoprock from '@/assets/env-poprock.jpg';
import envRaiz from '@/assets/env-raiz.jpg';
import envGospel from '@/assets/env-gospel.jpg';

const localImageMap: Record<string, string> = {
  aovivo: envSertanejo, sertanejo: envSertanejo, poprock: envPoprock, raiz: envRaiz, gospel: envGospel,
};

const EnvironmentSelector = () => {
  const { environments, currentEnvironmentSlug, setEnvironment, isBuffering } = useRadioStore();
  if (environments.length === 0) return null;

  const handleSelect = (slug: string) => {
    // Prevent switching while a load is in progress to avoid overlapping audio
    if (isBuffering && slug !== currentEnvironmentSlug) return;
    setEnvironment(slug);
  };

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-4 md:overflow-x-visible">
      {environments.map((env) => {
        const isActive = currentEnvironmentSlug === env.slug;
        const imgSrc = env.image_url || localImageMap[env.slug] || localImageMap.sertanejo;

        return (
          <motion.button
            key={env.id}
            onClick={() => handleSelect(env.slug)}
            whileTap={{ scale: 0.95 }}
            className={`relative flex-shrink-0 w-[130px] h-[80px] md:w-full md:h-[90px] rounded-2xl overflow-hidden transition-all duration-250 ${
              isActive
                ? 'ring-2 ring-primary/60 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.3)]'
                : 'ring-1 ring-white/[0.06] opacity-60 hover:opacity-80'
            }`}
          >
            <img src={imgSrc} alt={env.label} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 ${isActive ? 'bg-primary/20' : 'bg-black/50'}`} />
            <div className="relative z-10 flex items-end h-full p-3">
              {env.slug === 'aovivo' ? (
                <span className="inline-flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                  </span>
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">Ao Vivo</span>
                </span>
              ) : (
                <span className="text-white text-xs font-semibold drop-shadow-md">{env.label}</span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default EnvironmentSelector;
