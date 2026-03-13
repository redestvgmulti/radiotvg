import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Loader2, Power, Pencil, X, Trash2, Gift, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InputField, ImageUploadField } from '@/components/admin/AdminFormFields';

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
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExportCoupons = async () => {
    const { data, error } = await supabase.rpc('get_coupon_export');
    if (error) { toast({ title: 'Erro ao exportar', description: error.message, variant: 'destructive' }); return; }
    if (!data || (data as any[]).length === 0) { toast({ title: 'Sem dados', description: 'Nenhum cupom resgatado ainda.' }); return; }
    const rows = data as { display_name: string; email: string; reward_name: string; coupon_code: string; redeemed_at: string }[];
    const header = 'display_name,email,reward_name,coupon_code,redeemed_at';
    const csv = [header, ...rows.map(r => `"${r.display_name || ''}","${r.email || ''}","${r.reward_name || ''}","${r.coupon_code || ''}","${r.redeemed_at || ''}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cupons_resgatados.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exportado!' });
  };

  useEffect(() => { fetchRewards(); }, []);

  const fetchRewards = async () => {
    const { data, error } = await supabase.from('rewards').select('*').order('created_at', { ascending: false });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setRewards((data as Reward[]) || []); setLoading(false);
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
    setUploading(null); return urlData.publicUrl;
  };

  const handleCreate = async () => {
    if (!createForm.name) return; setCreating(true);
    const { error } = await supabase.from('rewards').insert({ name: createForm.name, image_url: createForm.image_url, points_cost: createForm.points_cost, partner: createForm.partner });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Recompensa criada!' }); setCreateForm({ name: '', image_url: '', points_cost: 100, partner: '' }); setShowCreate(false); fetchRewards(); }
    setCreating(false);
  };

  const startEdit = (r: Reward) => { setEditingId(r.id); setEditForm({ ...r }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId) return; setSaving(editingId);
    const { error } = await supabase.from('rewards').update({ name: editForm.name, image_url: editForm.image_url, points_cost: editForm.points_cost, partner: editForm.partner }).eq('id', editingId);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Salvo!' }); cancelEdit(); fetchRewards(); }
    setSaving(null);
  };

  const toggleActive = async (r: Reward) => { setSaving(r.id); await supabase.from('rewards').update({ is_active: !r.is_active }).eq('id', r.id); fetchRewards(); setSaving(null); };

  const deleteReward = async (r: Reward) => {
    if (!confirm(`Excluir "${r.name}"?`)) return;
    setSaving(r.id); await supabase.from('rewards').delete().eq('id', r.id); toast({ title: 'Excluído' }); fetchRewards(); setSaving(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin/dashboard')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center shadow-sm">
            <Gift className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Recompensas</h1>
            <p className="text-[10px] text-slate-400">{rewards.filter(r => r.is_active).length} ativas · {rewards.length} total</p>
          </div>
        </div>
        <button onClick={handleExportCoupons}
          className="h-8 px-3 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-200 transition-colors">
          <Download className="h-3.5 w-3.5" /> Exportar
        </button>
        <button onClick={() => setShowCreate(!showCreate)}
          className="h-8 px-3 rounded-lg bg-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-pink-600 transition-colors shadow-sm">
          {showCreate ? <X className="h-3.5 w-3.5" /> : <><Plus className="h-3.5 w-3.5" /> Nova</>}
        </button>
      </div>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 space-y-3">
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3 mb-4">
                <p className="text-xs font-semibold text-slate-600">Nova Recompensa</p>
                <InputField label="Nome" value={createForm.name} onChange={v => setCreateForm({ ...createForm, name: v })} placeholder="Nome da recompensa" />
                <ImageUploadField imageUrl={createForm.image_url} onUrlChange={url => setCreateForm({ ...createForm, image_url: url })} uploadKey="new-reward" uploading={uploading} onUpload={uploadImage} />
                <InputField label="Pontos Necessários" value={String(createForm.points_cost)} onChange={v => setCreateForm({ ...createForm, points_cost: Number(v) || 0 })} type="number" />
                <InputField label="Parceiro" value={createForm.partner} onChange={v => setCreateForm({ ...createForm, partner: v })} placeholder="Nome do parceiro" />
                <button onClick={handleCreate} disabled={creating || !createForm.name}
                  className="w-full h-9 rounded-lg bg-pink-500 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-pink-600 transition-colors shadow-sm">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Recompensa'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white border border-dashed border-slate-200">
            <Gift className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhuma recompensa cadastrada.</p>
          </div>
        ) : (
          rewards.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden ${!r.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 px-4 py-3.5">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.name} className="h-12 w-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><Gift className="h-5 w-5 text-slate-300" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-pink-600">{r.points_cost} pts</span>
                    {r.partner && <span className="text-[10px] text-slate-400">· {r.partner}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(r)} disabled={saving === r.id}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${r.is_active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                    <Power className="h-4 w-4" />
                  </button>
                  <button onClick={() => editingId === r.id ? cancelEdit() : startEdit(r)}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${editingId === r.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
                    {editingId === r.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteReward(r)} disabled={saving === r.id}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {editingId === r.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-3 space-y-3 border-t border-slate-100 bg-slate-50/50">
                      <InputField label="Nome" value={editForm.name || ''} onChange={v => setEditForm({ ...editForm, name: v })} />
                      <ImageUploadField imageUrl={editForm.image_url || ''} onUrlChange={url => setEditForm({ ...editForm, image_url: url })} uploadKey={r.id} uploading={uploading} onUpload={uploadImage} />
                      <InputField label="Pontos Necessários" value={String(editForm.points_cost || 0)} onChange={v => setEditForm({ ...editForm, points_cost: Number(v) || 0 })} type="number" />
                      <InputField label="Parceiro" value={editForm.partner || ''} onChange={v => setEditForm({ ...editForm, partner: v })} placeholder="Nome do parceiro" />
                      <button onClick={saveEdit} disabled={saving === r.id}
                        className="w-full h-9 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60 hover:bg-blue-700 transition-colors shadow-sm">
                        {saving === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Salvar</>}
                      </button>
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
