import { motion } from 'framer-motion';
import { User, Heart, History, Bell } from 'lucide-react';

const PerfilTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 px-4 pt-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">Perfil</h1>
      </div>

      {/* Avatar area */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-3">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground">Ouvinte</p>
        <p className="text-sm text-muted-foreground">Faça login para personalizar</p>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        {[
          { icon: Heart, label: 'Favoritos', count: '12' },
          { icon: History, label: 'Histórico', count: '48' },
          { icon: Bell, label: 'Notificações', count: '3' },
        ].map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full glass-subtle rounded-xl p-4 flex items-center gap-4 hover:bg-card/60 transition-colors"
          >
            <item.icon className="h-5 w-5 text-primary" />
            <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {item.count}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default PerfilTab;
