import { useRadioStore, environmentMeta, type Environment } from '@/stores/useRadioStore';
import { motion } from 'framer-motion';

const environments: Environment[] = ['sertanejo', 'poprock', 'raiz', 'gospel'];

const colorMap: Record<Environment, string> = {
  sertanejo: 'bg-env-sertanejo/20 border-env-sertanejo/30 text-env-sertanejo',
  poprock: 'bg-env-poprock/20 border-env-poprock/30 text-env-poprock',
  raiz: 'bg-env-raiz/20 border-env-raiz/30 text-env-raiz',
  gospel: 'bg-env-gospel/20 border-env-gospel/30 text-env-gospel',
};

const activeColorMap: Record<Environment, string> = {
  sertanejo: 'bg-env-sertanejo text-background border-env-sertanejo',
  poprock: 'bg-env-poprock text-background border-env-poprock',
  raiz: 'bg-env-raiz text-background border-env-raiz',
  gospel: 'bg-env-gospel text-background border-env-gospel',
};

const EnvironmentSelector = () => {
  const { currentEnvironment, setEnvironment } = useRadioStore();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-2">
      {environments.map((env) => {
        const meta = environmentMeta[env];
        const isActive = currentEnvironment === env;

        return (
          <motion.button
            key={env}
            onClick={() => setEnvironment(env)}
            whileTap={{ scale: 0.95 }}
            className={`relative flex-shrink-0 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-250 ${
              isActive ? activeColorMap[env] : colorMap[env]
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="env-bg"
                className="absolute inset-0 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{meta.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default EnvironmentSelector;
