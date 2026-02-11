import { useRadioStore, environmentMeta, type Environment } from '@/stores/useRadioStore';
import { motion } from 'framer-motion';

import envSertanejo from '@/assets/env-sertanejo.jpg';
import envPoprock from '@/assets/env-poprock.jpg';
import envRaiz from '@/assets/env-raiz.jpg';
import envGospel from '@/assets/env-gospel.jpg';

const environments: Environment[] = ['sertanejo', 'poprock', 'raiz', 'gospel'];

const imageMap: Record<Environment, string> = {
  sertanejo: envSertanejo,
  poprock: envPoprock,
  raiz: envRaiz,
  gospel: envGospel,
};

const glowActiveMap: Record<Environment, string> = {
  sertanejo: 'ring-2 ring-env-sertanejo/60 shadow-[0_0_20px_-4px_hsl(var(--env-sertanejo)/0.4)]',
  poprock: 'ring-2 ring-env-poprock/60 shadow-[0_0_20px_-4px_hsl(var(--env-poprock)/0.4)]',
  raiz: 'ring-2 ring-env-raiz/60 shadow-[0_0_20px_-4px_hsl(var(--env-raiz)/0.4)]',
  gospel: 'ring-2 ring-env-gospel/60 shadow-[0_0_20px_-4px_hsl(var(--env-gospel)/0.4)]',
};

const EnvironmentSelector = () => {
  const { currentEnvironment, setEnvironment } = useRadioStore();

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      {environments.map((env) => {
        const meta = environmentMeta[env];
        const isActive = currentEnvironment === env;

        return (
          <motion.button
            key={env}
            onClick={() => setEnvironment(env)}
            whileTap={{ scale: 0.95 }}
            className={`relative flex-shrink-0 w-[130px] h-[80px] rounded-2xl overflow-hidden transition-all duration-250 ${
              isActive ? glowActiveMap[env] : 'ring-1 ring-border/30 opacity-70'
            }`}
          >
            {/* Background image */}
            <img
              src={imageMap[env]}
              alt={meta.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Label */}
            <div className="relative z-10 flex items-end h-full p-3">
              <span className="text-white text-xs font-semibold drop-shadow-md">
                {meta.label}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default EnvironmentSelector;
