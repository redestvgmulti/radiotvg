import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Loader2, Power, Pencil, X, Trash2, Upload, ImageIcon, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reward {
  id: string;
  name: string;
  image_url: string;
  points_cost: number;
  partner: string;
  is_active: boolean;
}

const AdminRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Reward>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', image_url: '', points_cost: 100, partner: '' });
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { fetchRewards(); }, []);

  const fetchRewards = async () => {
    const { data, error } = await supabase.from('rewards').select('*').order('created_at', { ascending: false });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setRewards((data as Reward[]) || []);
    setLoading(false);
  };

  const uploadImage = async (file: File, key: string): Promise<string | null> => {
    if (!file.type.startsWith('image/')) { toast({ title: 'Erro', description: 'Selecione uma imagem.', variant: 'destructive' }); return null; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Erro', description: 'Máximo 5MB.', variant: 'destructive' }); return null; }
    setUploading(key);
    const ext = file.name.split('.').pop() || 'png';
    const path = `rewards/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('radio-assets').upload(path, file, { upsert: true });
    if (error) { toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' }); setUploading(null); return null; }
    const { data: urlData } = supabase.storage.from('radio-assets').getPublicUrl(path);
    setUploading(null);
    return urlData.publicUrl;
  };

  const handleCreate = async () => {
    if (!createForm.name) return;
    setCreating(true);
    const { error } = await supabase.from('rewards').insert({
      name: createForm.name, image_url: createForm.image_url,
      points_cost: createForm.points_cost, partner: createForm.partner,
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Recompensa criada!' }); setCreateForm({ name: '', image_url: '', points_cost: 100, partner: '' }); setShowCreate(false); fetchRewards(); }
    setCreating(false);
  };

  const startEdit = (r: Reward) => { setEditingId(r.id); setEditForm({ ...r }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(editingId);
    const { error } = await supabase.from('rewards').update({
      name: editForm.name, image_url: editForm.image_url,
      points_cost: editForm.points_cost, partner: editForm.partner,
    }).eq('id', editingId);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Salvo!' }); cancelEdit(); fetchRewards(); }
    setSaving(null);
  };

  const toggleActive = async (r: Reward) => {
    setSaving(r.id);
    await supabase.from('rewards').update({ is_active: !r.is_active }).eq('id', r.id);
    fetchRewards(); setSaving(null);
  };

  const deleteReward = async (r: Reward) => {
    if (!confirm(`Excluir "${r.name}"?`)) return;
    setSaving(r.id);
    await supabase.from('rewards').delete().eq('id', r.id);
    toast({ title: 'Excluído' }); fetchRewards(); setSaving(null);
  };

  const ImageUploadField = ({ imageUrl, onUrlChange, uploadKey }: { imageUrl: string; onUrlChange: (url: string) => void; uploadKey: string }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Imagem</label>
      {imageUrl ? (
        <div className="relative inline-block">
          <img src={imageUrl} alt="" className="h-14 w-auto rounded-xl border border-border object-contain bg-muted/30" />
          <button onClick={() => onUrlChange('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-2.5 w-2.5" /></button>
        </div>
      ) : (
        <div className="h-14 w-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/10"><ImageIcon className="h-4 w-4 text-muted-foreground/30" /></div>
      )}
      <input type="file" accept="image/*" ref={(el) => { fileInputRefs.current[uploadKey] = el; }} className="hidden"
        onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const url = await uploadImage(file, uploadKey); if (url) onUrlChange(url); } }} />
      <button type="button" onClick={() => fileInputRefs.current[uploadKey]?.click()} disabled={uploading === uploadKey}
        className="h-8 px-3 rounded-xl bg-muted text-foreground text-[10px] font-semibold flex items-center gap-1 disabled:opacity-60 hover:bg-muted/80 transition-colors">
        {uploading === uploadKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading === uploadKey ? 'Enviando...' : 'Upload'}
      </button>
    </div>
  );

  const InputField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50" />
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <button onClick={() => navigate('/admin')} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground">Recompensas</h1>
          <p className="text-xs text-muted-foreground">{rewards.filter(r => r.is_active).length} ativas · {rewards.length} total</p>
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nova Recompensa</p>
                <InputField label="Nome" value={createForm.name} onChange={v => setCreateForm({ ...createForm, name: v })} placeholder="Nome da recompensa" />
                <ImageUploadField imageUrl={createForm.image_url} onUrlChange={url => setCreateForm({ ...createForm, image_url: url })} uploadKey="new-reward" />
                <InputField label="Pontos Necessários" value={String(createForm.points_cost)} onChange={v => setCreateForm({ ...createForm, points_cost: Number(v) || 0 })} type="number" />
                <InputField label="Parceiro" value={createForm.partner} onChange={v => setCreateForm({ ...createForm, partner: v })} placeholder="Nome do parceiro" />
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={creating || !createForm.name}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Recompensa'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Gift className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma recompensa cadastrada.</p>
          </div>
        ) : (
          rewards.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border bg-card overflow-hidden ${r.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.name} className="h-12 w-12 rounded-xl object-cover border border-border flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0"><Gift className="h-5 w-5 text-muted-foreground/30" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{r.points_cost} pts</span>
                    {r.partner && <span className="text-[9px] text-muted-foreground">· {r.partner}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(r)} disabled={saving === r.id}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${r.is_active ? 'text-green-500 hover:bg-green-500/10' : 'text-muted-foreground hover:bg-muted'}`}>
                    <Power className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => editingId === r.id ? cancelEdit() : startEdit(r)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    {editingId === r.id ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => deleteReward(r)} disabled={saving === r.id}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {editingId === r.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border">
                      <InputField label="Nome" value={editForm.name || ''} onChange={v => setEditForm({ ...editForm, name: v })} />
                      <ImageUploadField imageUrl={editForm.image_url || ''} onUrlChange={url => setEditForm({ ...editForm, image_url: url })} uploadKey={r.id} />
                      <InputField label="Pontos Necessários" value={String(editForm.points_cost || 0)} onChange={v => setEditForm({ ...editForm, points_cost: Number(v) || 0 })} type="number" />
                      <InputField label="Parceiro" value={editForm.partner || ''} onChange={v => setEditForm({ ...editForm, partner: v })} placeholder="Nome do parceiro" />
                      <motion.button whileTap={{ scale: 0.98 }} onClick={saveEdit} disabled={saving === r.id}
                        className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {saving === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Salvar</>}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
};

export default AdminRewards;
