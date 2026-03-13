import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Pencil, Trash2, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface Program {
  id: string;
  name: string;
  host: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  station_id: string | null;
}

interface Station {
  id: string;
  label: string;
}

const emptyForm = { name: '', host: '', day_of_week: 1, start_time: '08:00', end_time: '09:00', station_id: '' };

const AdminPrograms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchData = async () => {
    const [programsRes, stationsRes] = await Promise.all([
      supabase.from('programs').select('*').order('day_of_week').order('start_time'),
      supabase.from('stream_environments').select('id, label').order('sort_order'),
    ]);
    setPrograms((programsRes.data as Program[]) || []);
    setStations((stationsRes.data as Station[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return toast({ title: 'Nome obrigatório', variant: 'destructive' });
    const payload = {
      name: form.name, host: form.host, day_of_week: form.day_of_week,
      start_time: form.start_time, end_time: form.end_time, station_id: form.station_id || null,
    };
    const { error } = editingId
      ? await supabase.from('programs').update(payload).eq('id', editingId)
      : await supabase.from('programs').insert(payload);
    if (error) return toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    toast({ title: editingId ? 'Programa atualizado' : 'Programa criado' });
    setShowForm(false); setEditingId(null); setForm(emptyForm); fetchData();
  };

  const handleEdit = (p: Program) => {
    setForm({ name: p.name, host: p.host, day_of_week: p.day_of_week, start_time: p.start_time.slice(0, 5), end_time: p.end_time.slice(0, 5), station_id: p.station_id || '' });
    setEditingId(p.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('programs').delete().eq('id', id);
    toast({ title: 'Programa removido' }); fetchData();
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    await supabase.from('programs').update({ is_active }).eq('id', id); fetchData();
  };

  const getStationLabel = (id: string | null) => stations.find(s => s.id === id)?.label;
  const filtered = selectedDay !== null ? programs.filter(p => p.day_of_week === selectedDay) : programs;

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin/dashboard')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shadow-sm">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Programação</h1>
            <p className="text-[10px] text-slate-400">Grade de programas</p>
          </div>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(!showForm); }}
          className="h-8 px-3 rounded-lg bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-violet-600 transition-colors shadow-sm">
          {showForm ? <X className="h-3.5 w-3.5" /> : <><Plus className="h-3.5 w-3.5" /> Novo</>}
        </button>
      </div>

      {showForm && (
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-slate-600">{editingId ? 'Editar' : 'Novo'} Programa</p>
          <Input placeholder="Nome do programa" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9 text-sm bg-white border-slate-200" />
          <Input placeholder="Apresentador" value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} className="h-9 text-sm bg-white border-slate-200" />
          <Select value={String(form.day_of_week)} onValueChange={v => setForm(f => ({ ...f, day_of_week: Number(v) }))}>
            <SelectTrigger className="h-9 text-sm bg-white border-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.station_id} onValueChange={v => setForm(f => ({ ...f, station_id: v === '__none__' ? '' : v }))}>
            <SelectTrigger className="h-9 text-sm bg-white border-slate-200"><SelectValue placeholder="Estação (todas)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Todas as estações</SelectItem>
              {stations.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 mb-1 block">Início</label>
              <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="h-9 text-sm bg-white border-slate-200" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 mb-1 block">Fim</label>
              <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="h-9 text-sm bg-white border-slate-200" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} className="flex-1 h-9 rounded-lg bg-violet-500 text-white font-semibold text-xs hover:bg-violet-600 transition-colors shadow-sm">Salvar</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="h-9 px-4 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* Day filter */}
      <div className="px-5 py-3 flex gap-1.5 overflow-x-auto bg-white border-b border-slate-200">
        <button onClick={() => setSelectedDay(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedDay === null ? 'bg-violet-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Todos</button>
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setSelectedDay(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedDay === i ? 'bg-violet-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{d.slice(0, 3)}</button>
        ))}
      </div>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-10">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white border border-dashed border-slate-200">
            <Calendar className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum programa encontrado.</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${!p.is_active ? 'opacity-50' : ''}`}>
              <div className="flex flex-col items-center justify-center w-12 shrink-0 bg-slate-50 rounded-lg py-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                <span className="text-[10px] font-medium text-slate-600 leading-tight">{p.start_time.slice(0, 5)}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{p.end_time.slice(0, 5)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                {p.host && <p className="text-[11px] text-slate-500 truncate">{p.host}</p>}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400">{DAYS[p.day_of_week]}</span>
                  {p.station_id && (
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-500 font-medium">
                      {getStationLabel(p.station_id) || 'Estação'}
                    </span>
                  )}
                </div>
              </div>
              <Switch checked={p.is_active} onCheckedChange={v => handleToggle(p.id, v)} className="scale-75" />
              <button onClick={() => handleEdit(p)} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="h-8 w-8 rounded-lg bg-slate-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center">
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
};

export default AdminPrograms;
