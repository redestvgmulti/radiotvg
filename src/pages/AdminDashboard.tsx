import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, Megaphone, Calendar, Loader2, Circle, Gift, Zap, Ticket, Instagram, ChevronRight, Activity, MessageCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface StreamEnv {
  label: string;
  is_active: boolean;
  stream_url: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const AdminDashboard = () => {
  const [environments, setEnvironments] = useState<StreamEnv[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      // Busca ambientes
      const { data: envs } = await supabase
        .from('stream_environments')
        .select('label, is_active, stream_url')
        .order('sort_order');
      setEnvironments(envs || []);

      // Busca dados para badges de forma paralela
      const promises = [
        supabase.from('rewards').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vouchers').select('*', { count: 'exact', head: true }),
        supabase.from('programs').select('*', { count: 'exact', head: true })
      ];

      try {
        const results = await Promise.all(promises);
        setStats({
          rewards: results[0].count || 0,
          users: results[1].count || 0,
          vouchers: results[2].count || 0,
          programs: results[3].count || 0,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      }

      setLoading(false);
    };
    init();
  }, []);

  const activeEnvs = environments.filter(e => e.is_active);
  const hasStream = activeEnvs.some(e => e.stream_url);
  const onlineCount = environments.filter(e => e.is_active && e.stream_url).length;

  const sections = [
    {
      label: 'Operação',
      items: [
        { icon: Radio, label: 'Streams', desc: 'Gerenciar estações', path: '/admin/streaming', color: 'bg-blue-500', badge: environments.length },
        { icon: Megaphone, label: 'Ads', desc: 'Anúncios e patrocínios', path: '/admin/ads', color: 'bg-orange-500' },
      ],
    },
    {
      label: 'Conteúdo',
      items: [
        { icon: Calendar, label: 'Programação', desc: 'Grade de programas', path: '/admin/programs', color: 'bg-violet-500', badge: stats.programs },
        { icon: Gift, label: 'Recompensas', desc: 'Catálogo ativo', path: '/admin/rewards', color: 'bg-pink-500', badge: stats.rewards },
        { icon: Zap, label: 'Boosters', desc: 'Multiplicadores (X2)', path: '/admin/boosters', color: 'bg-amber-500' },
        { icon: Ticket, label: 'Vouchers', desc: 'Gestão de resgates', path: '/admin/vouchers', color: 'bg-emerald-500', badge: stats.vouchers },
        { icon: Instagram, label: 'Instagram', desc: 'Posts na home', path: '/admin/instagram', color: 'bg-rose-500' },
        { icon: MessageCircle, label: 'WhatsApp', desc: 'Número e mensagem', path: '/admin/whatsapp', color: 'bg-green-500' },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { icon: Users, label: 'Usuários', desc: 'Gerenciar audiência', path: '/admin/users', color: 'bg-slate-700', badge: stats.users },
        { icon: Bell, label: 'Mensagem Push', desc: 'Envio de notificação', path: '/admin/push', color: 'bg-indigo-500' },
      ],
    },
  ];

  return (
    <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Live Status Card - Premium View */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-blue-100/60 bg-gradient-to-br from-blue-50/50 to-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative overflow-hidden"
        >
          {/* Subtle Glow background */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shadow-inner">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">Status ao Vivo</h2>
                <p className="text-[11px] text-slate-500">Monitoramento da rádio em tempo real</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm border ${hasStream ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <Circle className={`h-2.5 w-2.5 fill-current ${hasStream ? 'animate-pulse text-green-600' : 'text-slate-400'}`} />
              {hasStream ? 'TRANSMITINDO' : 'OFFLINE'}
            </div>
          </div>

          {/* Stats row with premium cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 relative">
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-black text-slate-800">{environments.length}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Estações</p>
            </div>
            <div className="rounded-xl bg-green-50/50 backdrop-blur-sm border border-green-200/50 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-black text-green-600">{onlineCount}</p>
              <p className="text-[11px] font-semibold text-green-600/70 mt-1 uppercase tracking-wider">Online</p>
            </div>
            <div className="rounded-xl bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-black text-slate-400">{environments.length - onlineCount}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Offline</p>
            </div>
          </div>

          <div className="space-y-2 relative">
            {environments.map((env) => (
              <div key={env.label} className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-white/60 border border-transparent hover:border-slate-100 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${env.is_active && env.stream_url ? 'bg-green-500 shadow-green-500/40' : 'bg-slate-300'}`} />
                  <span className="text-sm text-slate-700 font-semibold">{env.label}</span>
                </div>
                {env.stream_url ? (
                  <span className="text-xs text-slate-500 font-mono truncate max-w-[120px] sm:max-w-[200px]">{env.stream_url.split('/').pop()}</span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">Sem URL</span>
                )}
              </div>
            ))}
            {environments.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-slate-400">Nenhum ambiente de transmissão configurado.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <motion.div
            key={section.label}
            variants={container}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <h3 className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 uppercase tracking-[0.15em]">
                {section.label}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((navItem) => (
                <motion.button
                  key={navItem.label}
                  variants={item}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(navItem.path)}
                  className="w-full flex items-center gap-3.5 px-4 py-4 rounded-xl bg-white border border-slate-200/70 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] hover:border-slate-300 transition-all text-left group"
                >
                  <div className={`w-11 h-11 rounded-xl ${navItem.color} flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300`}>
                    <navItem.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-600">{navItem.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{navItem.desc}</p>
                  </div>
                  
                  {/* Badge numérico se existir */}
                  {navItem.badge !== undefined && (
                    <div className="flex-shrink-0 mr-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 font-bold text-[10px] flex items-center justify-center min-w-[32px]">
                      {navItem.badge}
                    </div>
                  )}

                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
