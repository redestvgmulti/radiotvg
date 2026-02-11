import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Radio, Users, Settings, Video, Megaphone, Calendar, Loader2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface StreamEnv {
  label: string;
  is_active: boolean;
  stream_url: string | null;
}

const AdminDashboard = () => {
  const [userEmail, setUserEmail] = useState('');
  const [environments, setEnvironments] = useState<StreamEnv[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin/login'); return; }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) { await supabase.auth.signOut(); navigate('/admin/login'); return; }
      setUserEmail(session.user.email || '');

      const { data: envs } = await supabase
        .from('stream_environments')
        .select('label, is_active, stream_url')
        .order('sort_order');
      setEnvironments(envs || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const activeEnvs = environments.filter(e => e.is_active);
  const hasStream = activeEnvs.some(e => e.stream_url);

  const sections = [
    {
      label: 'OPERAÇÃO',
      items: [
        { icon: Radio, label: 'Streaming', desc: 'Áudio · Ambientes', path: '/admin/streaming' },
        { icon: Video, label: 'Vídeo / Live', desc: 'Stream de vídeo · LIVE', path: '/admin/video' },
      ],
    },
    {
      label: 'CONTEÚDO',
      items: [
        { icon: Megaphone, label: 'Patrocinadores', desc: 'Gestão de sponsors', path: '/admin/sponsors' },
        { icon: Calendar, label: 'Programação', desc: 'Grade de programas', path: '/admin/programs' },
      ],
    },
    {
      label: 'SISTEMA',
      items: [
        { icon: Users, label: 'Usuários', desc: 'Roles e permissões', path: '/admin/users' },
        { icon: Settings, label: 'Configurações', desc: 'Settings gerais', path: '/admin/config' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Compact header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Admin · Rádio TVG</h1>
          <p className="text-[10px] text-muted-foreground">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="h-7 px-2.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <LogOut className="h-3 w-3" />
          Sair
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Live Status Card */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Status ao Vivo</span>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${hasStream ? 'text-green-500' : 'text-muted-foreground'}`}>
                <Circle className={`h-2 w-2 fill-current ${hasStream ? 'animate-pulse' : ''}`} />
                {hasStream ? 'NO AR' : 'OFFLINE'}
              </div>
            </div>
            <div className="space-y-1">
              {environments.map((env) => (
                <div key={env.label} className="flex items-center justify-between py-1">
                  <span className="text-xs text-foreground">{env.label}</span>
                  <div className="flex items-center gap-2">
                    {env.stream_url ? (
                      <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">{env.stream_url.split('/').pop()}</span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground/50">sem URL</span>
                    )}
                    <div className={`w-1.5 h-1.5 rounded-full ${env.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  </div>
                </div>
              ))}
              {environments.length === 0 && (
                <p className="text-[11px] text-muted-foreground py-1">Nenhum ambiente configurado</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation sections */}
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1.5 px-1">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors text-left"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
