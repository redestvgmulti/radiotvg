import { useLocation, useNavigate } from 'react-router-dom';
import { Radio, Tv, LayoutGrid, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', label: 'Rádio', icon: Radio },
  { path: '/video', label: 'Vídeo', icon: Tv },
  { path: '/programas', label: 'Programas', icon: LayoutGrid },
  { path: '/perfil', label: 'Perfil', icon: User },
  { path: '/config', label: 'Config', icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong bottom-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
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
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-primary"
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
