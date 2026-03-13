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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: envs } = await supabase
        .from('stream_environments')
        .select('label, is_active, stream_url')
        .order('sort_order');
      setEnvironments(envs || []);
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
        { icon: Radio, label: 'Streams', desc: 'Gerenciar estações', path: '/admin/streaming', color: 'bg-blue-500' },
        { icon: Megaphone, label: 'Ads', desc: 'Anúncios e patrocínios', path: '/admin/ads', color: 'bg-orange-500' },
      ],
    },
    {
      label: 'Conteúdo',
      items: [
        { icon: Calendar, label: 'Programação', desc: 'Grade de programas', path: '/admin/programs', color: 'bg-violet-500' },
        { icon: Gift, label: 'Recompensas', desc: 'Catálogo de recompensas', path: '/admin/rewards', color: 'bg-pink-500' },
        { icon: Zap, label: 'Boosters', desc: 'Multiplicadores de pontos', path: '/admin/boosters', color: 'bg-amber-500' },
        { icon: Ticket, label: 'Vouchers', desc: 'Gestão de vouchers', path: '/admin/vouchers', color: 'bg-emerald-500' },
        { icon: Instagram, label: 'Instagram', desc: 'Posts do Instagram na home', path: '/admin/instagram', color: 'bg-rose-500' },
        { icon: MessageCircle, label: 'WhatsApp', desc: 'Número e mensagem', path: '/admin/whatsapp', color: 'bg-green-500' },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { icon: Users, label: 'Usuários', desc: 'Roles e permissões', path: '/admin/users', color: 'bg-slate-500' },
        { icon: Bell, label: 'Mensagem Push', desc: 'Notificações push', path: '/admin/push', color: 'bg-indigo-500' },
      ],
    },
  ];

  return (
    <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Live Status Card */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-gradient-to-br from-slate-50 to-white shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-800">Status ao Vivo</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${hasStream ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              <Circle className={`h-2 w-2 fill-current ${hasStream ? 'animate-pulse' : ''}`} />
              {hasStream ? 'NO AR' : 'OFFLINE'}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-white border border-slate-100 p-3 text-center">
              <p className="text-2xl font-bold text-slate-800">{environments.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Estações</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Online</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-3 text-center">
              <p className="text-2xl font-bold text-slate-400">{environments.length - onlineCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Offline</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {environments.map((env) => (
              <div key={env.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${env.is_active && env.stream_url ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="text-sm text-slate-700 font-medium">{env.label}</span>
                </div>
                {env.stream_url ? (
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{env.stream_url.split('/').pop()}</span>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">sem URL</span>
                )}
              </div>
            ))}
            {environments.length === 0 && (
              <p className="text-xs text-slate-400 py-2 text-center">Nenhum ambiente configurado</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation sections */}
      {sections.map((section) => (
        <motion.div
          key={section.label}
          variants={container}
          initial="hidden"
          animate="show"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
            {section.label}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {section.items.map((navItem) => (
              <motion.button
                key={navItem.label}
                variants={item}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(navItem.path)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-slate-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-200 transition-all text-left group"
              >
                <div className={`w-9 h-9 rounded-lg ${navItem.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <navItem.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{navItem.label}</p>
                  <p className="text-[11px] text-slate-500">{navItem.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminDashboard;
