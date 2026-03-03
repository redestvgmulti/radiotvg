import { motion } from 'framer-motion';
import { Volume2, Palette, Shield, Info, ChevronRight, Moon, Sun } from 'lucide-react';

const sections = [
  {
    title: 'Reprodução',
    items: [
      { icon: Volume2, label: 'Qualidade de áudio', value: 'Alta', chevron: true },
    ],
  },
  {
    title: 'Aparência',
    items: [
      { icon: Palette, label: 'Tema', value: 'Claro', chevron: true },
    ],
  },
  {
    title: 'Geral',
    items: [
      { icon: Shield, label: 'Privacidade', value: '', chevron: true },
      { icon: Info, label: 'Sobre', value: 'v1.0.0', chevron: true },
    ],
  },
];

const ConfigTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-36"
    >
      {/* Minimal Header */}
      <header className="px-5 pt-4 pb-4">
        <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Configurações</h1>
      </header>

      {/* Sections */}
      <div className="px-4 space-y-6">
        {sections.map((section, si) => (
          <div key={section.title}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
              {section.title}
            </p>
            <div className="flex flex-col gap-1.5">
              {section.items.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.08 + i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-white/[0.04] transition-colors duration-200 hover:bg-card/80"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
                  {item.value && (
                    <span className="text-xs text-muted-foreground">{item.value}</span>
                  )}
                  {item.chevron && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ConfigTab;
