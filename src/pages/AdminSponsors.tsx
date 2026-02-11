import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Loader2, Power, Pencil, X, Trash2, Upload, ImageIcon, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Sponsor {
  id: string;
  name: string;
  image_url: string;
  link_url: string;
  display_time: number;
  is_active: boolean;
  sort_order: number;
}

const DISPLAY_OPTIONS = [15, 30, 45] as const;

const AdminSponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Sponsor>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', image_url: '', link_url: '', display_time: 15 });
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const createFileRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { fetchSponsors(); }, []);

  const fetchSponsors = async () => {
    const { data, error } = await supabase.from('sponsors').select('*').order('sort_order').order('created_at');
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    setSponsors(data || []);
    setLoading(false);
  };

  const uploadImage = async (file: File, key: string): Promise<string | null> => {
    if (!file.type.startsWith('image/')) { toast({ title: 'Erro', description: 'Selecione uma imagem.', variant: 'destructive' }); return null; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Erro', description: 'Máximo 5MB.', variant: 'destructive' }); return null; }
    setUploading(key);
    const ext = file.name.split('.').pop() || 'png';
    const path = `sponsors/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('radio-assets').upload(path, file, { upsert: true });
    if (error) { toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' }); setUploading(null); return null; }
    const { data: urlData } = supabase.storage.from('radio-assets').getPublicUrl(path);
    setUploading(null);
    return urlData.publicUrl;
  };

  const handleCreate = async () => {
    if (!createForm.name) return;
    setCreating(true);
    const { error } = await supabase.from('sponsors').insert({
      name: createForm.name,
      image_url: createForm.image_url,
      link_url: createForm.link_url,
      display_time: createForm.display_time,
      sort_order: sponsors.length,
    });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Patrocinador criado!' }); setCreateForm({ name: '', image_url: '', link_url: '', display_time: 15 }); setShowCreate(false); fetchSponsors(); }
    setCreating(false);
  };

  const startEdit = (s: Sponsor) => { setEditingId(s.id); setEditForm({ ...s }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(editingId);
    const { error } = await supabase.from('sponsors').update({
      name: editForm.name, image_url: editForm.image_url, link_url: editForm.link_url, display_time: editForm.display_time,
    }).eq('id', editingId);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Salvo!' }); cancelEdit(); fetchSponsors(); }
    setSaving(null);
  };

  const toggleActive = async (s: Sponsor) => {
    setSaving(s.id);
    await supabase.from('sponsors').update({ is_active: !s.is_active }).eq('id', s.id);
    fetchSponsors();
    setSaving(null);
  };

  const deleteSponsor = async (s: Sponsor) => {
    if (!confirm(`Excluir "${s.name}"?`)) return;
    setSaving(s.id);
    await supabase.from('sponsors').delete().eq('id', s.id);
    toast({ title: 'Excluído' });
    fetchSponsors();
    setSaving(null);
  };

  const TimeSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {DISPLAY_OPTIONS.map((t) => (
        <button key={t} type="button" onClick={() => onChange(t)}
          className={`h-7 px-2.5 rounded-md text-[10px] font-bold transition-colors ${value === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
          {t}s
        </button>
      ))}
    </div>
  );

  const ImageUploadField = ({ imageUrl, onUrlChange, uploadKey }: { imageUrl: string; onUrlChange: (url: string) => void; uploadKey: string }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Imagem</label>
      {imageUrl ? (
        <div className="relative inline-block">
          <img src={imageUrl} alt="" className="h-14 w-auto rounded-lg border border-border object-contain bg-muted/30" />
          <button onClick={() => onUrlChange('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ) : (
        <div className="h-14 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/10">
          <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
        </div>
      )}
      <input type="file" accept="image/*" ref={(el) => { fileInputRefs.current[uploadKey] = el; }} className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) { const url = await uploadImage(file, uploadKey); if (url) onUrlChange(url); }
        }} />
      <button type="button" onClick={() => fileInputRefs.current[uploadKey]?.click()} disabled={uploading === uploadKey}
        className="h-7 px-3 rounded-md bg-muted text-foreground text-[10px] font-semibold flex items-center gap-1 disabled:opacity-60 hover:bg-muted/80 transition-colors">
        {uploading === uploadKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading === uploadKey ? 'Enviando...' : 'Upload'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate('/admin')} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Patrocinadores</h1>
          <p className="text-[10px] text-muted-foreground">{sponsors.filter(s => s.is_active).length} ativos · {sponsors.length} total</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
          {showCreate ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {/* Create Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="rounded-lg border border-border bg-card p-3 space-y-2.5 mb-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Novo Patrocinador</p>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Nome</label>
                  <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Nome do patrocinador"
                    className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                <ImageUploadField imageUrl={createForm.image_url} onUrlChange={(url) => setCreateForm({ ...createForm, image_url: url })} uploadKey="new" />
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Link (URL)</label>
                  <input type="url" value={createForm.link_url} onChange={(e) => setCreateForm({ ...createForm, link_url: e.target.value })}
                    placeholder="https://patrocinador.com"
                    className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Tempo de exibição</label>
                  <TimeSelector value={createForm.display_time} onChange={(v) => setCreateForm({ ...createForm, display_time: v })} />
                </div>
                <button onClick={handleCreate} disabled={creating || !createForm.name}
                  className="w-full h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60">
                  {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Criar'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">Nenhum patrocinador cadastrado.</p>
          </div>
        ) : (
          sponsors.map((s) => (
            <div key={s.id} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                {/* Thumbnail */}
                {s.image_url ? (
                  <img src={s.image_url} alt={s.name} className="h-9 w-9 rounded-md object-cover border border-border flex-shrink-0" />
                ) : (
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />{s.display_time}s
                    </span>
                    {s.link_url && (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 truncate max-w-[100px]">
                        <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />{s.link_url.replace(/https?:\/\//, '').split('/')[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(s)} disabled={saving === s.id}
                    className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${s.is_active ? 'text-green-500 hover:bg-green-500/10' : 'text-muted-foreground hover:bg-muted'}`}>
                    <Power className="h-3 w-3" />
                  </button>
                  <button onClick={() => editingId === s.id ? cancelEdit() : startEdit(s)}
                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    {editingId === s.id ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                  </button>
                  <button onClick={() => deleteSponsor(s)} disabled={saving === s.id}
                    className="h-6 w-6 rounded flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Edit */}
              <AnimatePresence>
                {editingId === s.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                    <div className="px-3 pb-3 pt-2 space-y-2 border-t border-border">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Nome</label>
                        <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                      </div>
                      <ImageUploadField imageUrl={editForm.image_url || ''} onUrlChange={(url) => setEditForm({ ...editForm, image_url: url })} uploadKey={s.id} />
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Link (URL)</label>
                        <input type="url" value={editForm.link_url || ''} onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })}
                          placeholder="https://patrocinador.com"
                          className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Tempo de exibição</label>
                        <TimeSelector value={editForm.display_time || 15} onChange={(v) => setEditForm({ ...editForm, display_time: v })} />
                      </div>
                      <button onClick={saveEdit} disabled={saving === s.id}
                        className="w-full h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60">
                        {saving === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="h-3 w-3" /> Salvar</>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSponsors;
