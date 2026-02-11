import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, Save, Loader2, X, Upload, ImageIcon, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GalleryItem {
  id: string;
  title: string;
  thumbnail_url: string | null;
  media_url: string | null;
  media_type: string;
  duration: string | null;
  sort_order: number;
  is_active: boolean;
}

interface EditingItem {
  id?: string;
  title: string;
  thumbnail_url: string;
  media_url: string;
  media_type: string;
  duration: string;
  is_active: boolean;
}

const emptyItem: EditingItem = { title: '', thumbnail_url: '', media_url: '', media_type: 'video', duration: '', is_active: true };

const AdminProgramGallery = () => {
  const { id: programId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [programName, setProgramName] = useState('');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState<EditingItem | null>(null);

  const fetchAll = useCallback(async () => {
    if (!programId) return;
    const [progRes, galRes] = await Promise.all([
      supabase.from('programs').select('name').eq('id', programId).maybeSingle(),
      supabase.from('program_gallery').select('*').eq('program_id', programId).order('sort_order'),
    ]);
    setProgramName(progRes.data?.name || 'Programa');
    setItems((galRes.data as GalleryItem[]) || []);
    setLoading(false);
  }, [programId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleUpload = useCallback(async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `gallery/${programId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('radio-assets').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } else {
      const { data: urlData } = supabase.storage.from('radio-assets').getPublicUrl(path);
      setEditing(prev => prev ? { ...prev, thumbnail_url: urlData.publicUrl } : prev);
    }
    setUploading(false);
  }, [editing, programId, toast]);

  const saveItem = async () => {
    if (!editing || !editing.title.trim() || !programId) return;
    setSaving(true);

    if (editing.id) {
      const { error } = await supabase.from('program_gallery').update({
        title: editing.title, thumbnail_url: editing.thumbnail_url, media_url: editing.media_url,
        media_type: editing.media_type, duration: editing.duration, is_active: editing.is_active,
      }).eq('id', editing.id);
      if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      else toast({ title: 'Item atualizado!' });
    } else {
      const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 1;
      const { error } = await supabase.from('program_gallery').insert({
        program_id: programId, title: editing.title, thumbnail_url: editing.thumbnail_url,
        media_url: editing.media_url, media_type: editing.media_type, duration: editing.duration,
        is_active: editing.is_active, sort_order: nextOrder,
      });
      if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      else toast({ title: 'Item adicionado!' });
    }

    setEditing(null);
    setSaving(false);
    fetchAll();
  };

  const toggleActive = async (item: GalleryItem) => {
    await supabase.from('program_gallery').update({ is_active: !item.is_active }).eq('id', item.id);
    fetchAll();
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('program_gallery').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Item removido!' }); fetchAll(); }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate('/admin/programs')} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-foreground truncate">Galeria — {programName}</h1>
          <p className="text-[10px] text-muted-foreground">Gerenciar mídias do programa</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing({ ...emptyItem })}
          className="h-7 px-2.5 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1">
          <Plus className="h-3 w-3" /> Novo
        </motion.button>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 rounded-lg border border-dashed border-border">
            <Film className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum item na galeria</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Clique em "Novo" para adicionar</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div key={item.id} layout className={`rounded-lg border bg-card overflow-hidden ${item.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}>
              <div className="flex gap-3 p-2.5">
                <div className="relative flex-shrink-0 w-20 h-[45px] rounded-md overflow-hidden bg-muted/30">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Film className="h-4 w-4 text-muted-foreground/30" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-muted-foreground capitalize">{item.media_type}</span>
                    {item.duration && <span className="text-[9px] text-muted-foreground">{item.duration}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(item)} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
                    {item.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <button onClick={() => setEditing({ id: item.id, title: item.title, thumbnail_url: item.thumbnail_url || '', media_url: item.media_url || '', media_type: item.media_type, duration: item.duration || '', is_active: item.is_active })}
                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-card border-t border-border rounded-t-2xl p-4 space-y-3 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">{editing.id ? 'Editar Item' : 'Novo Item'}</p>
                <button onClick={() => setEditing(null)} className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Título *</label>
                <input type="text" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Nome do conteúdo" className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Thumbnail</label>
                {editing.thumbnail_url ? (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-muted/30 group"
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={async e => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files?.[0]; if (file?.type.startsWith('image/')) await handleUpload(file); }}>
                    <img src={editing.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-2 ${dragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {dragging ? (
                        <span className="text-white text-xs font-semibold">Solte para trocar</span>
                      ) : (
                        <>
                          <label className="h-8 px-3 rounded-md bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-white/30 transition-colors">
                            <Upload className="h-3 w-3" /> Trocar
                            <input type="file" accept="image/*" className="hidden" onChange={async e => { const file = e.target.files?.[0]; if (file) await handleUpload(file); }} />
                          </label>
                          <button onClick={() => setEditing({ ...editing, thumbnail_url: '' })}
                            className="h-8 px-3 rounded-md bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-red-500/60 transition-colors">
                            <Trash2 className="h-3 w-3" /> Remover
                          </button>
                        </>
                      )}
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <label
                    className={`w-full h-28 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer ${uploading ? 'pointer-events-none border-border' : dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={async e => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files?.[0]; if (file?.type.startsWith('image/')) await handleUpload(file); }}>
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : dragging ? (
                      <>
                        <Upload className="h-6 w-6 text-primary/60" />
                        <span className="text-[10px] text-primary font-medium">Solte a imagem aqui</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground">Clique ou arraste uma imagem</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const file = e.target.files?.[0]; if (file) await handleUpload(file); }} />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">URL da Mídia (HLS / MP4)</label>
                <input type="url" value={editing.media_url} onChange={e => setEditing({ ...editing, media_url: e.target.value })}
                  placeholder="https://stream.exemplo.com/video.m3u8" className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Tipo</label>
                  <select value={editing.media_type} onChange={e => setEditing({ ...editing, media_type: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
                    <option value="video">Vídeo</option>
                    <option value="audio">Áudio</option>
                    <option value="image">Imagem</option>
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Duração</label>
                  <input type="text" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })}
                    placeholder="1:30:00" className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setEditing({ ...editing, is_active: !editing.is_active })}
                  className={`h-8 px-3 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${editing.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                  {editing.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {editing.is_active ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={saveItem} disabled={saving || !editing.title.trim()}
                className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {editing.id ? 'Atualizar' : 'Adicionar'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminProgramGallery;
