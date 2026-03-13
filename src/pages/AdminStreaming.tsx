import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Power, Pencil, X, Plus, Trash2, Radio, Signal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InputField } from '@/components/admin/AdminFormFields';

interface StreamEnv {
  id: string;
  slug: string;
  label: string;
  description: string;
  stream_url: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

const emptyNew = { label: '', slug: '', stream_url: '', image_url: '', sort_order: 0 };

const AdminStreaming = () => {
  const [environments, setEnvironments] = useState<StreamEnv[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StreamEnv>>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState(emptyNew);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { fetchEnvironments(); }, []);

  const fetchEnvironments = async () => {
    const { data, error } = await supabase
      .from('stream_environments').select('*').order('sort_order');
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setEnvironments(data || []);
    setLoading(false);
  };

  const startEdit = (env: StreamEnv) => { setEditingId(env.id); setEditForm({ ...env }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    setSaving(editingId);
    const { error } = await supabase
      .from('stream_environments')
      .update({ label: editForm.label, description: editForm.description, stream_url: editForm.stream_url, image_url: editForm.image_url })
      .eq('id', editingId);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Salvo!' }); cancelEdit(); fetchEnvironments(); }
    setSaving(null);
  };

  const toggleActive = async (env: StreamEnv) => {
    setSaving(env.id);
    const { error } = await supabase
      .from('stream_environments').update({ is_active: !env.is_active }).eq('id', env.id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else fetchEnvironments();
    setSaving(null);
  };

  const handleCreate = async () => {
    if (!newForm.label.trim() || !newForm.slug.trim()) {
      toast({ title: 'Nome e slug obrigatórios', variant: 'destructive' });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('stream_environments').insert({
      label: newForm.label,
      slug: newForm.slug,
      stream_url: newForm.stream_url,
      image_url: newForm.image_url,
      sort_order: newForm.sort_order,
      is_active: true,
    });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Ambiente criado!' }); setShowNew(false); setNewForm(emptyNew); fetchEnvironments(); }
    setCreating(false);
  };

  const handleDelete = async (env: StreamEnv) => {
    if (!confirm(`Excluir "${env.label}"? Esta ação não pode ser desfeita.`)) return;
    setSaving(env.id);
    const { error } = await supabase.from('stream_environments').delete().eq('id', env.id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Ambiente removido' }); fetchEnvironments(); }
    setSaving(null);
  };

  const activeCount = environments.filter(e => e.is_active).length;

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
            <Radio className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Streaming</h1>
            <p className="text-[10px] text-slate-400">Áudio · Ambientes</p>
          </div>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="h-3.5 w-3.5" /> Novo
        </button>
      </div>

      {/* New environment form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-slate-200">
            <div className="px-5 py-4 space-y-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600">Novo Ambiente</p>
              <InputField label="Nome" value={newForm.label} onChange={v => setNewForm(f => ({ ...f, label: v }))} placeholder="Ex: Sertanejo" />
              <InputField label="Slug (único)" value={newForm.slug} onChange={v => setNewForm(f => ({ ...f, slug: v }))} placeholder="Ex: sertanejo" />
              <InputField label="URL do Stream (HLS)" value={newForm.stream_url} onChange={v => setNewForm(f => ({ ...f, stream_url: v }))} placeholder="https://stream.exemplo.com/live.m3u8" type="url" />
              <InputField label="URL da Imagem" value={newForm.image_url} onChange={v => setNewForm(f => ({ ...f, image_url: v }))} placeholder="https://exemplo.com/imagem.jpg" type="url" />
              <InputField label="Ordem" value={String(newForm.sort_order)} onChange={v => setNewForm(f => ({ ...f, sort_order: parseInt(v) || 0 }))} type="number" />
              <div className="flex gap-2 pt-1">
                <button onClick={handleCreate} disabled={creating}
                  className="flex-1 h-9 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60 hover:bg-blue-700 transition-colors shadow-sm">
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Criar</>}
                </button>
                <button onClick={() => setShowNew(false)} className="h-9 px-4 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 text-center">
              <p className="text-2xl font-bold text-slate-800">{environments.length}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Total</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Ativos</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 text-center">
              <p className="text-2xl font-bold text-slate-400">{environments.length - activeCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Inativos</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : (
          <div className="space-y-3">
            {environments.map((env) => (
              <motion.div
                key={env.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${env.is_active ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <Signal className={`h-4.5 w-4.5 ${env.is_active ? 'text-green-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{env.label}</p>
                    <p className="text-[11px] text-slate-400 truncate font-mono">{env.stream_url || 'Sem URL configurada'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(env)} disabled={saving === env.id}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${env.is_active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => editingId === env.id ? cancelEdit() : startEdit(env)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${editingId === env.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
                      {editingId === env.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleDelete(env)} disabled={saving === env.id}
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {editingId === env.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-slate-100 bg-slate-50/50">
                        <InputField label="Nome" value={editForm.label || ''} onChange={(v) => setEditForm({ ...editForm, label: v })} />
                        <InputField label="Descrição" value={editForm.description || ''} onChange={(v) => setEditForm({ ...editForm, description: v })} />
                        <InputField label="URL do Stream (HLS)" value={editForm.stream_url || ''} onChange={(v) => setEditForm({ ...editForm, stream_url: v })} placeholder="https://stream.exemplo.com/live.m3u8" type="url" />
                        <InputField label="URL da Imagem" value={editForm.image_url || ''} onChange={(v) => setEditForm({ ...editForm, image_url: v })} placeholder="https://exemplo.com/imagem.jpg" type="url" />
                        <button onClick={saveEdit} disabled={saving === env.id}
                          className="w-full h-9 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60 hover:bg-blue-700 transition-colors shadow-sm">
                          {saving === env.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Salvar</>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminStreaming;
