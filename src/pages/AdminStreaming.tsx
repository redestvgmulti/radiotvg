import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Power, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const AdminStreaming = () => {
  const [environments, setEnvironments] = useState<StreamEnv[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StreamEnv>>({});
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

  const InputField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate('/admin')} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Streaming</h1>
          <p className="text-[10px] text-muted-foreground">Áudio · Ambientes</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-2">
            {environments.map((env) => (
              <div key={env.id} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${env.is_active ? 'bg-green-500' : 'bg-muted-foreground/20'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{env.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{env.stream_url || 'Sem URL'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(env)} disabled={saving === env.id}
                      className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${env.is_active ? 'text-green-500 hover:bg-green-500/10' : 'text-muted-foreground hover:bg-muted'}`}>
                      <Power className="h-3 w-3" />
                    </button>
                    <button onClick={() => editingId === env.id ? cancelEdit() : startEdit(env)}
                      className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      {editingId === env.id ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* Edit panel */}
                <AnimatePresence>
                  {editingId === env.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                      <div className="px-3 pb-3 pt-2 space-y-2 border-t border-border">
                        <InputField label="Nome" value={editForm.label || ''} onChange={(v) => setEditForm({ ...editForm, label: v })} />
                        <InputField label="Descrição" value={editForm.description || ''} onChange={(v) => setEditForm({ ...editForm, description: v })} />
                        <InputField label="URL do Stream (HLS)" value={editForm.stream_url || ''} onChange={(v) => setEditForm({ ...editForm, stream_url: v })} placeholder="https://stream.exemplo.com/live.m3u8" type="url" />
                        <InputField label="URL da Imagem" value={editForm.image_url || ''} onChange={(v) => setEditForm({ ...editForm, image_url: v })} placeholder="https://exemplo.com/imagem.jpg" type="url" />
                        <button onClick={saveEdit} disabled={saving === env.id}
                          className="w-full h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60">
                          {saving === env.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="h-3 w-3" /> Salvar</>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStreaming;
