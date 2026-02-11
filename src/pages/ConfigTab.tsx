import { motion } from 'framer-motion';
import { Settings, Volume2, Palette, Shield, Info } from 'lucide-react';

const ConfigTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 px-4 pt-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">Configurações</h1>
      </div>

      <div className="space-y-2">
        {[
          { icon: Volume2, label: 'Qualidade de áudio', value: 'Alta' },
          { icon: Palette, label: 'Aparência', value: 'Escuro' },
          { icon: Shield, label: 'Privacidade', value: '' },
          { icon: Info, label: 'Sobre', value: 'v1.0.0' },
        ].map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full glass-subtle rounded-xl p-4 flex items-center gap-4 hover:bg-card/60 transition-colors"
          >
            <item.icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
            {item.value && (
              <span className="text-xs text-muted-foreground">{item.value}</span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ConfigTab;
