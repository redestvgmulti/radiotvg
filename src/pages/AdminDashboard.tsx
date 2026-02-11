import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Radio, Users, Settings, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoRadio from '@/assets/logo-radio-tvg.png';

const AdminDashboard = () => {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      setUserEmail(session.user.email || '');
    };

    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: Radio, label: 'Streaming', description: 'Gerenciar streams e ambientes', color: 'text-blue-500', path: '/admin/streaming' },
    { icon: Users, label: 'Usuários', description: 'Gerenciar usuários e permissões', color: 'text-green-500', path: '/admin/users' },
    { icon: BarChart3, label: 'Estatísticas', description: 'Visualizar métricas e analytics', color: 'text-purple-500', path: '' },
    { icon: Settings, label: 'Configurações', description: 'Configurações do sistema', color: 'text-orange-500', path: '' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
        <div className="h-10 overflow-hidden flex items-center">
          <img src={logoRadio} alt="Rádio TVG" className="h-[200%] w-auto object-contain object-center" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 py-6">
        <h1 className="text-lg font-display font-bold text-foreground mb-1">Painel Admin</h1>
        <p className="text-sm text-muted-foreground mb-6">Gerencie a Rádio TVG</p>

        <div className="grid gap-3">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center gap-4 p-4 rounded-2xl bg-card border border-border transition-colors ${item.path ? 'cursor-pointer hover:border-primary/30' : 'opacity-50 cursor-not-allowed'}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
