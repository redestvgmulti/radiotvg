import { useRadioStore, getEnvColorVar } from '@/stores/useRadioStore';
import { motion } from 'framer-motion';

import envSertanejo from '@/assets/env-sertanejo.jpg';
import envPoprock from '@/assets/env-poprock.jpg';
import envRaiz from '@/assets/env-raiz.jpg';
import envGospel from '@/assets/env-gospel.jpg';

const localImageMap: Record<string, string> = {
  sertanejo: envSertanejo, poprock: envPoprock, raiz: envRaiz, gospel: envGospel,
};

const EnvironmentSelector = () => {
  const { environments, currentEnvironmentSlug, setEnvironment } = useRadioStore();
  if (environments.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-4 md:overflow-x-visible">
      {environments.map((env) => {
        const isActive = currentEnvironmentSlug === env.slug;
        const imgSrc = env.image_url || localImageMap[env.slug] || localImageMap.sertanejo;

        return (
          <motion.button
            key={env.id}
            onClick={() => setEnvironment(env.slug)}
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
              <span className="text-white text-xs font-semibold drop-shadow-md">{env.label}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default EnvironmentSelector;
