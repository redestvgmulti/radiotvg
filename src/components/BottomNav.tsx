import { useLocation, useNavigate } from 'react-router-dom';
import { Radio, LayoutGrid, Gift, User } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', label: 'Rádio', icon: Radio },
  { path: '/programas', label: 'Programas', icon: LayoutGrid },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/perfil', label: 'Perfil', icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 player-bar-gradient border-t border-white/[0.06] bottom-safe">
      <div className="flex items-center justify-around h-16 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`h-5 w-5 transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
