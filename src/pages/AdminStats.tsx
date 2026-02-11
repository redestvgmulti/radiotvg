import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Radio, Eye, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// TODO: Replace mock data with real analytics
const listenersWeek = [
  { day: 'Seg', ouvintes: 1240 }, { day: 'Ter', ouvintes: 1580 }, { day: 'Qua', ouvintes: 1320 },
  { day: 'Qui', ouvintes: 1890 }, { day: 'Sex', ouvintes: 2100 }, { day: 'Sáb', ouvintes: 2450 }, { day: 'Dom', ouvintes: 2780 },
];
const accessByHour = [
  { hora: '6h', acessos: 320 }, { hora: '8h', acessos: 580 }, { hora: '10h', acessos: 720 }, { hora: '12h', acessos: 890 },
  { hora: '14h', acessos: 650 }, { hora: '16h', acessos: 780 }, { hora: '18h', acessos: 920 }, { hora: '20h', acessos: 1100 },
  { hora: '22h', acessos: 850 }, { hora: '00h', acessos: 420 },
];
const envDistribution = [
  { name: 'Sertanejo', value: 42, color: 'hsl(35, 90%, 55%)' }, { name: 'Pop/Rock', value: 28, color: 'hsl(280, 70%, 55%)' },
  { name: 'Gospel', value: 18, color: 'hsl(200, 80%, 55%)' }, { name: 'Raiz', value: 12, color: 'hsl(140, 60%, 45%)' },
];
const stats = [
  { label: 'Ouvintes Agora', value: '2.3K', icon: Users, trend: '+12%', up: true },
  { label: 'Acessos Hoje', value: '8.4K', icon: Eye, trend: '+8%', up: true },
  { label: 'Tempo Médio', value: '24min', icon: Clock, trend: '-3%', up: false },
  { label: 'Pico do Dia', value: '3.1K', icon: Radio, trend: '+18%', up: true },
];

const AdminStats = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <button onClick={() => navigate('/admin')} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-display font-bold text-foreground">Estatísticas</h1>
          <p className="text-xs text-muted-foreground">Métricas e analytics</p>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          {(['7d', '30d'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {p === '7d' ? '7 dias' : '30 dias'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${s.up ? 'text-green-500' : 'text-red-400'}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{s.trend}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-xs font-semibold text-foreground mb-3">Ouvintes por Dia</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={listenersWeek}>
                <defs><linearGradient id="colorOuvintes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                <Area type="monotone" dataKey="ouvintes" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorOuvintes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-xs font-semibold text-foreground mb-3">Acessos por Horário</p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accessByHour}>
                <XAxis dataKey="hora" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="acessos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-xs font-semibold text-foreground mb-3">Distribuição por Ambiente</p>
          <div className="flex items-center gap-4">
            <div className="h-[120px] w-[120px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={envDistribution} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {envDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {envDistribution.map((e) => (
                <div key={e.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                  <span className="text-[11px] text-foreground flex-1">{e.name}</span>
                  <span className="text-[11px] font-bold text-foreground">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminStats;
