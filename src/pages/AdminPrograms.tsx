import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Pencil, Trash2, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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

const emptyForm = { name: '', host: '', day_of_week: 1, all_days: false, start_time: '08:00', end_time: '09:00', station_id: '' };

const inputClass = "w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors";
const selectClass = "w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none";

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
    const basePayload = {
      name: form.name, host: form.host,
      start_time: form.start_time, end_time: form.end_time, station_id: form.station_id || null,
    };

    if (editingId) {
      const payload = { ...basePayload, day_of_week: form.day_of_week };
      const { error } = await supabase.from('programs').update(payload).eq('id', editingId);
      if (error) return toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      toast({ title: 'Programa atualizado' });
    } else if (form.all_days) {
      const rows = Array.from({ length: 7 }, (_, i) => ({ ...basePayload, day_of_week: i }));
      const { error } = await supabase.from('programs').insert(rows);
      if (error) return toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      toast({ title: 'Programa criado para todos os dias' });
    } else {
      const payload = { ...basePayload, day_of_week: form.day_of_week };
      const { error } = await supabase.from('programs').insert(payload);
      if (error) return toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      toast({ title: 'Programa criado' });
    }
    setShowForm(false); setEditingId(null); setForm(emptyForm); fetchData();
  };

  const handleEdit = (p: Program) => {
    setForm({ name: p.name, host: p.host, day_of_week: p.day_of_week, all_days: false, start_time: p.start_time.slice(0, 5), end_time: p.end_time.slice(0, 5), station_id: p.station_id || '' });
    setEditingId(p.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('programs').delete().eq('id', id);
    toast({ title: 'Programa removido' }); fetchData();
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    await supabase.from('programs').update({ is_active: !currentActive }).eq('id', id); fetchData();
  };

  const getStationLabel = (id: string | null) => stations.find(s => s.id === id)?.label;
  const filtered = selectedDay !== null ? programs.filter(p => p.day_of_week === selectedDay) : programs;

  const getShiftColor = (time: string) => {
    const hour = parseInt(time.split(':')[0] || '0', 10);
    if (hour >= 5 && hour < 12) return 'bg-amber-400'; // Manhã
    if (hour >= 12 && hour < 18) return 'bg-orange-500'; // Tarde
    if (hour >= 18 && hour < 24) return 'bg-indigo-600'; // Noite
    return 'bg-slate-800'; // Madrugada
  };

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
          <input placeholder="Nome do programa" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
          <input placeholder="Apresentador" value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} className={inputClass} />
          {!editingId && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.all_days} onChange={e => setForm(f => ({ ...f, all_days: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-violet-500 focus:ring-violet-500" />
              <span className="text-xs font-medium text-slate-700">Todos os dias</span>
            </label>
          )}
          {!form.all_days && (
            <select value={String(form.day_of_week)} onChange={e => setForm(f => ({ ...f, day_of_week: Number(e.target.value) }))} className={selectClass}>
              {DAYS.map((d, i) => <option key={i} value={String(i)}>{d}</option>)}
            </select>
          )}
          <select value={form.station_id || '__none__'} onChange={e => setForm(f => ({ ...f, station_id: e.target.value === '__none__' ? '' : e.target.value }))} className={selectClass}>
            <option value="__none__">Todas as estações</option>
            {stations.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 mb-1 block">Início</label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 mb-1 block">Fim</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className={inputClass} />
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
              className={`flex items-center gap-3 p-3.5 pl-0 pr-4 rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden relative ${!p.is_active ? 'opacity-50 grayscale-[20%]' : ''}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getShiftColor(p.start_time)}`} />
              <div className="flex flex-col items-center justify-center w-12 shrink-0 bg-slate-50/80 rounded-lg py-1.5 ml-3.5">
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
              {/* Toggle */}
              <button onClick={() => handleToggle(p.id, p.is_active)}
                className={`w-10 h-5 rounded-full relative transition-colors ${p.is_active ? 'bg-green-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${p.is_active ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
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
