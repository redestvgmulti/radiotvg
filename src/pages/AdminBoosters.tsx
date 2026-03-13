import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Loader2, Power, Pencil, X, Trash2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InputField } from '@/components/admin/AdminFormFields';

interface Booster {
  id: string;
  multiplier: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const toInputDatetime = (d: string) => d ? new Date(d).toISOString().slice(0, 16) : '';
const isCurrentlyActive = (b: Booster) => {
  if (!b.is_active) return false;
  const now = new Date();
  return new Date(b.start_date) <= now && new Date(b.end_date) >= now;
};

const AdminBoosters = () => {
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Booster>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ multiplier: 2, start_date: '', end_date: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { fetchBoosters(); }, []);

  const fetchBoosters = async () => {
    const { data, error } = await supabase.from('boosters').select('*').order('start_date', { ascending: false });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setBoosters((data as Booster[]) || []); setLoading(false);
  };

  const handleCreate = async () => {
    if (!createForm.start_date || !createForm.end_date) { toast({ title: 'Preencha as datas', variant: 'destructive' }); return; }
    setCreating(true);
    const { error } = await supabase.from('boosters').insert({ multiplier: createForm.multiplier, start_date: new Date(createForm.start_date).toISOString(), end_date: new Date(createForm.end_date).toISOString() });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Booster criado!' }); setCreateForm({ multiplier: 2, start_date: '', end_date: '' }); setShowCreate(false); fetchBoosters(); }
    setCreating(false);
  };

  const startEdit = (b: Booster) => { setEditingId(b.id); setEditForm({ ...b }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId) return; setSaving(editingId);
    const { error } = await supabase.from('boosters').update({ multiplier: editForm.multiplier, start_date: editForm.start_date ? new Date(editForm.start_date).toISOString() : undefined, end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : undefined }).eq('id', editingId);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Salvo!' }); cancelEdit(); fetchBoosters(); }
    setSaving(null);
  };

  const toggleActive = async (b: Booster) => { setSaving(b.id); await supabase.from('boosters').update({ is_active: !b.is_active }).eq('id', b.id); fetchBoosters(); setSaving(null); };

  const deleteBooster = async (b: Booster) => {
    if (!confirm(`Excluir booster ${b.multiplier}x?`)) return;
    setSaving(b.id); await supabase.from('boosters').delete().eq('id', b.id); toast({ title: 'Excluído' }); fetchBoosters(); setSaving(null);
  };

  const MultiplierSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div>
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">Multiplicador</label>
      <div className="flex gap-1.5">
        {[1.5, 2, 3, 5].map(m => (
          <button key={m} type="button" onClick={() => onChange(m)}
            className={`h-9 px-4 rounded-lg text-xs font-bold transition-colors ${value === m ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {m}x
          </button>
        ))}
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value) || 1)} min={1} step={0.5}
          className="w-16 h-9 px-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin/dashboard')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Boosters</h1>
            <p className="text-[10px] text-slate-400">Multiplicadores de pontos</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="h-8 px-3 rounded-lg bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-600 transition-colors shadow-sm">
          {showCreate ? <X className="h-3.5 w-3.5" /> : <><Plus className="h-3.5 w-3.5" /> Novo</>}
        </button>
      </div>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 space-y-3">
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3 mb-4">
                <p className="text-xs font-semibold text-slate-600">Novo Booster</p>
                <MultiplierSelector value={createForm.multiplier} onChange={v => setCreateForm({ ...createForm, multiplier: v })} />
                <InputField label="Data Início" value={createForm.start_date} onChange={v => setCreateForm({ ...createForm, start_date: v })} type="datetime-local" />
                <InputField label="Data Fim" value={createForm.end_date} onChange={v => setCreateForm({ ...createForm, end_date: v })} type="datetime-local" />
                <button onClick={handleCreate} disabled={creating || !createForm.start_date || !createForm.end_date}
                  className="w-full h-9 rounded-lg bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-amber-600 transition-colors shadow-sm">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Booster'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : boosters.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white border border-dashed border-slate-200">
            <Zap className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum booster cadastrado.</p>
          </div>
        ) : (
          boosters.map((b, i) => {
            const active = isCurrentlyActive(b);
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden ${!b.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="text-lg font-bold">{b.multiplier}x</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">Multiplicador {b.multiplier}x</p>
                      {active && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5" /> Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(b.start_date)} → {formatDate(b.end_date)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(b)} disabled={saving === b.id}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${b.is_active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => editingId === b.id ? cancelEdit() : startEdit(b)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${editingId === b.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
                      {editingId === b.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deleteBooster(b)} disabled={saving === b.id}
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {editingId === b.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-slate-100 bg-slate-50/50">
                        <MultiplierSelector value={editForm.multiplier || 2} onChange={v => setEditForm({ ...editForm, multiplier: v })} />
                        <InputField label="Data Início" value={toInputDatetime(editForm.start_date || '')} onChange={v => setEditForm({ ...editForm, start_date: v })} type="datetime-local" />
                        <InputField label="Data Fim" value={toInputDatetime(editForm.end_date || '')} onChange={v => setEditForm({ ...editForm, end_date: v })} type="datetime-local" />
                        <button onClick={saveEdit} disabled={saving === b.id}
                          className="w-full h-9 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60 hover:bg-blue-700 transition-colors shadow-sm">
                          {saving === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Salvar</>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </>
  );
};

export default AdminBoosters;
