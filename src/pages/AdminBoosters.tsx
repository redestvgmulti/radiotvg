import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Loader2, Power, Pencil, X, Trash2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    setBoosters((data as Booster[]) || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!createForm.start_date || !createForm.end_date) { toast({ title: 'Preencha as datas', variant: 'destructive' }); return; }
    setCreating(true);
    const { error } = await supabase.from('boosters').insert({
      multiplier: createForm.multiplier,
      start_date: new Date(createForm.start_date).toISOString(),
      end_date: new Date(createForm.end_date).toISOString(),
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Booster criado!' }); setCreateForm({ multiplier: 2, start_date: '', end_date: '' }); setShowCreate(false); fetchBoosters(); }
    setCreating(false);
  };

  const startEdit = (b: Booster) => { setEditingId(b.id); setEditForm({ ...b }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(editingId);
    const { error } = await supabase.from('boosters').update({
      multiplier: editForm.multiplier,
      start_date: editForm.start_date ? new Date(editForm.start_date).toISOString() : undefined,
      end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : undefined,
    }).eq('id', editingId);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Salvo!' }); cancelEdit(); fetchBoosters(); }
    setSaving(null);
  };

  const toggleActive = async (b: Booster) => {
    setSaving(b.id);
    await supabase.from('boosters').update({ is_active: !b.is_active }).eq('id', b.id);
    fetchBoosters(); setSaving(null);
  };

  const deleteBooster = async (b: Booster) => {
    if (!confirm(`Excluir booster ${b.multiplier}x?`)) return;
    setSaving(b.id);
    await supabase.from('boosters').delete().eq('id', b.id);
    toast({ title: 'Excluído' }); fetchBoosters(); setSaving(null);
  };

  const InputField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50" />
    </div>
  );

  const MultiplierSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Multiplicador</label>
      <div className="flex gap-1.5">
        {[1.5, 2, 3, 5].map(m => (
          <button key={m} type="button" onClick={() => onChange(m)}
            className={`h-9 px-4 rounded-xl text-xs font-bold transition-colors ${value === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {m}x
          </button>
        ))}
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value) || 1)} min={1} step={0.5}
          className="w-16 h-9 px-2 rounded-xl bg-background border border-border text-xs text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <button onClick={() => navigate('/admin')} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground">Boosters</h1>
          <p className="text-xs text-muted-foreground">Multiplicadores de pontos</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreate(!showCreate)}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </motion.button>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-3">
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Novo Booster</p>
                <MultiplierSelector value={createForm.multiplier} onChange={v => setCreateForm({ ...createForm, multiplier: v })} />
                <InputField label="Data Início" value={createForm.start_date} onChange={v => setCreateForm({ ...createForm, start_date: v })} type="datetime-local" />
                <InputField label="Data Fim" value={createForm.end_date} onChange={v => setCreateForm({ ...createForm, end_date: v })} type="datetime-local" />
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={creating || !createForm.start_date || !createForm.end_date}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Booster'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : boosters.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Zap className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum booster cadastrado.</p>
          </div>
        ) : (
          boosters.map((b, i) => {
            const active = isCurrentlyActive(b);
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border bg-card overflow-hidden ${b.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                    <span className="text-lg font-bold">{b.multiplier}x</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">Multiplicador {b.multiplier}x</p>
                      {active && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5" /> Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(b.start_date)} → {formatDate(b.end_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(b)} disabled={saving === b.id}
                      className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${b.is_active ? 'text-green-500 hover:bg-green-500/10' : 'text-muted-foreground hover:bg-muted'}`}>
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => editingId === b.id ? cancelEdit() : startEdit(b)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      {editingId === b.id ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => deleteBooster(b)} disabled={saving === b.id}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {editingId === b.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border">
                        <MultiplierSelector value={editForm.multiplier || 2} onChange={v => setEditForm({ ...editForm, multiplier: v })} />
                        <InputField label="Data Início" value={toInputDatetime(editForm.start_date || '')} onChange={v => setEditForm({ ...editForm, start_date: v })} type="datetime-local" />
                        <InputField label="Data Fim" value={toInputDatetime(editForm.end_date || '')} onChange={v => setEditForm({ ...editForm, end_date: v })} type="datetime-local" />
                        <motion.button whileTap={{ scale: 0.98 }} onClick={saveEdit} disabled={saving === b.id}
                          className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                          {saving === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Salvar</>}
                        </motion.button>
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
