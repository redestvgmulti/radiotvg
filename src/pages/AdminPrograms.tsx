import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Pencil, Trash2, Clock, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface Program {
  id: string;
  name: string;
  host: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const emptyForm = { name: '', host: '', day_of_week: 1, start_time: '08:00', end_time: '09:00' };

const AdminPrograms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchPrograms = async () => {
    const { data } = await supabase.from('programs').select('*').order('day_of_week').order('start_time');
    setPrograms((data as Program[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return toast({ title: 'Nome obrigatório', variant: 'destructive' });
    const payload = { name: form.name, host: form.host, day_of_week: form.day_of_week, start_time: form.start_time, end_time: form.end_time };
    const { error } = editingId
      ? await supabase.from('programs').update(payload).eq('id', editingId)
      : await supabase.from('programs').insert(payload);
    if (error) return toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    toast({ title: editingId ? 'Programa atualizado' : 'Programa criado' });
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchPrograms();
  };

  const handleEdit = (p: Program) => {
    setForm({ name: p.name, host: p.host, day_of_week: p.day_of_week, start_time: p.start_time.slice(0, 5), end_time: p.end_time.slice(0, 5) });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('programs').delete().eq('id', id);
    toast({ title: 'Programa removido' });
    fetchPrograms();
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    await supabase.from('programs').update({ is_active }).eq('id', id);
    fetchPrograms();
  };

  const filtered = selectedDay !== null ? programs.filter(p => p.day_of_week === selectedDay) : programs;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate('/admin')} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Programação</h1>
          <p className="text-[10px] text-muted-foreground">Grade de programas</p>
        </div>
        <Button size="sm" className="h-7 text-[10px] gap-1" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
          <Plus className="h-3 w-3" /> Novo
        </Button>
      </div>

      {showForm && (
        <div className="border-b border-border bg-muted/30 px-4 py-3 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">{editingId ? 'Editar' : 'Novo'} Programa</p>
          <Input placeholder="Nome do programa" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-xs" />
          <Input placeholder="Apresentador" value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} className="h-8 text-xs" />
          <Select value={String(form.day_of_week)} onValueChange={v => setForm(f => ({ ...f, day_of_week: Number(v) }))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground">Início</label>
              <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground">Fim</label>
              <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-[10px] flex-1" onClick={handleSave}>Salvar</Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="px-4 py-2 flex gap-1 overflow-x-auto border-b border-border">
        <button onClick={() => setSelectedDay(null)} className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${selectedDay === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Todos</button>
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setSelectedDay(i)} className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${selectedDay === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{d.slice(0, 3)}</button>
        ))}
      </div>

      <div className="px-4 py-2 space-y-1.5">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum programa encontrado.</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className={`flex items-center gap-2 p-2 rounded-md border ${p.is_active ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-60'}`}>
              <div className="flex flex-col items-center justify-center w-10 shrink-0">
                <Clock className="h-3 w-3 text-muted-foreground mb-0.5" />
                <span className="text-[9px] text-muted-foreground leading-tight">{p.start_time.slice(0, 5)}</span>
                <span className="text-[9px] text-muted-foreground leading-tight">{p.end_time.slice(0, 5)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                {p.host && <p className="text-[10px] text-muted-foreground truncate">{p.host}</p>}
                <p className="text-[9px] text-muted-foreground/60">{DAYS[p.day_of_week]}</p>
              </div>
              <Switch checked={p.is_active} onCheckedChange={v => handleToggle(p.id, v)} className="scale-75" />
              <button onClick={() => navigate(`/admin/programs/${p.id}/gallery`)} className="h-6 w-6 rounded bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground" title="Galeria">
                <Image className="h-3 w-3" />
              </button>
              <button onClick={() => handleEdit(p)} className="h-6 w-6 rounded bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                <Pencil className="h-3 w-3" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="h-6 w-6 rounded bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default AdminPrograms;
