import { motion } from 'framer-motion';
import { User, Heart, History, Bell, ChevronRight, LogIn } from 'lucide-react';
import heroPerfil from '@/assets/hero-perfil.jpg';

const menuItems = [
  { icon: Heart, label: 'Favoritos', count: '12' },
  { icon: History, label: 'Histórico', count: '48' },
  { icon: Bell, label: 'Notificações', count: '3' },
];

const PerfilTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-24"
    >
      {/* Minimal Header */}
      <header className="px-5 pt-4 pb-2">
        <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Perfil</h1>
      </header>

      {/* Profile Hero Card */}
      <div className="relative mx-4 mb-6 rounded-3xl overflow-hidden h-[28vh] sm:h-[24vh] md:h-[22vh]" style={{ minHeight: 180, maxHeight: 300 }}>
        <img
          src={heroPerfil}
          alt="Perfil"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-6">
          {/* Avatar */}
          <div className="w-18 h-18 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-3">
            <User className="h-8 w-8 text-white/60" />
          </div>
          <p className="text-white text-lg font-display font-bold">Ouvinte</p>
          <p className="text-white/40 text-xs mt-0.5">Personalize sua experiência</p>
        </div>
      </div>

      {/* Login CTA */}
      <div className="px-4 mb-5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:brightness-110"
        >
          <LogIn className="h-4 w-4" />
          Entrar na conta
        </motion.button>
      </div>

      {/* Menu Items */}
      <div className="px-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
          Minha Atividade
        </p>
        <div className="flex flex-col gap-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/20 transition-colors duration-200 hover:bg-card/60"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-xs font-semibold text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full">
                {item.count}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PerfilTab;
