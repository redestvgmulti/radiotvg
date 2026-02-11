import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Video, Circle, Plus, Trash2, GripVertical, Eye, EyeOff, Pencil, X, Film, Upload, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoItem {
  id: string;
  title: string;
  thumbnail_url: string | null;
  hls_url: string | null;
  duration: string | null;
  is_active: boolean;
  sort_order: number;
  views_count: number | null;
}

interface EditingVideo {
  id?: string;
  title: string;
  thumbnail_url: string;
  hls_url: string;
  duration: string;
  is_active: boolean;
}

const emptyVideo: EditingVideo = { title: '', thumbnail_url: '', hls_url: '', duration: '', is_active: true };

const AdminVideo = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditingVideo | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [originalLive, setOriginalLive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAll = async () => {
    const [settingsRes, videosRes] = await Promise.all([
      supabase.from('radio_settings').select('*').in('key', ['video_stream_url', 'video_is_live']),
      supabase.from('videos').select('*').order('sort_order'),
    ]);

    if (settingsRes.data) {
      const url = settingsRes.data.find(s => s.key === 'video_stream_url')?.value || '';
      const live = settingsRes.data.find(s => s.key === 'video_is_live')?.value === 'true';
      setVideoUrl(url); setIsLive(live); setOriginalUrl(url); setOriginalLive(live);
    }
    setVideos((videosRes.data as VideoItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const hasLiveChanges = videoUrl !== originalUrl || isLive !== originalLive;

  const saveLiveSettings = async () => {
    setSaving(true);
    const results = await Promise.all([
      supabase.from('radio_settings').update({ value: videoUrl }).eq('key', 'video_stream_url'),
      supabase.from('radio_settings').update({ value: isLive ? 'true' : 'false' }).eq('key', 'video_is_live'),
    ]);
    const failed = results.find(r => r.error);
    if (failed?.error) {
      toast({ title: 'Erro', description: failed.error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Configurações de live salvas!' });
      setOriginalUrl(videoUrl); setOriginalLive(isLive);
    }
    setSaving(false);
  };

  const saveVideo = async () => {
    if (!editing || !editing.title.trim()) return;
    setSaving(true);

    if (editing.id) {
      const { error } = await supabase.from('videos').update({
        title: editing.title, thumbnail_url: editing.thumbnail_url, hls_url: editing.hls_url,
        duration: editing.duration, is_active: editing.is_active,
      }).eq('id', editing.id);
      if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      else toast({ title: 'Vídeo atualizado!' });
    } else {
      const nextOrder = videos.length > 0 ? Math.max(...videos.map(v => v.sort_order)) + 1 : 1;
      const { error } = await supabase.from('videos').insert({
        title: editing.title, thumbnail_url: editing.thumbnail_url, hls_url: editing.hls_url,
        duration: editing.duration, is_active: editing.is_active, sort_order: nextOrder,
      });
      if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      else toast({ title: 'Vídeo adicionado!' });
    }

    setEditing(null);
    setSaving(false);
    fetchAll();
  };

  const toggleActive = async (video: VideoItem) => {
    await supabase.from('videos').update({ is_active: !video.is_active }).eq('id', video.id);
    fetchAll();
  };

  const deleteVideo = async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Vídeo removido!' }); fetchAll(); }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate('/admin')} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Vídeo / Live</h1>
          <p className="text-[10px] text-muted-foreground">Gerenciar stream e biblioteca de vídeos</p>
        </div>
        {hasLiveChanges && (
          <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileTap={{ scale: 0.95 }}
            onClick={saveLiveSettings} disabled={saving}
            className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1 disabled:opacity-60">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Salvar
          </motion.button>
        )}
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {/* Live Settings */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Transmissão ao Vivo</p>
                  <p className="text-[10px] text-muted-foreground">Badge LIVE no app</p>
                </div>
                <button onClick={() => setIsLive(!isLive)}
                  className={`h-8 px-3 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${isLive ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  <Circle className={`h-2 w-2 fill-current ${isLive ? 'animate-pulse' : ''}`} />
                  {isLive ? 'LIVE' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">URL do Stream (HLS)</label>
              <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://stream.exemplo.com/video.m3u8"
                className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>

            {/* Video Library */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Biblioteca de Vídeos</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing({ ...emptyVideo })}
                className="h-7 px-2.5 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1">
                <Plus className="h-3 w-3" /> Novo
              </motion.button>
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-6 rounded-lg border border-dashed border-border">
                <Film className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum vídeo cadastrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {videos.map((video) => (
                  <motion.div key={video.id} layout className={`rounded-lg border bg-card overflow-hidden ${video.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}>
                    <div className="flex gap-3 p-2.5">
                      <div className="relative flex-shrink-0 w-20 h-[45px] rounded-md overflow-hidden bg-muted/30">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Film className="h-4 w-4 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{video.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {video.duration && <span className="text-[9px] text-muted-foreground">{video.duration}</span>}
                          <span className="text-[9px] text-muted-foreground">{video.views_count || 0} views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => toggleActive(video)} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
                          {video.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </button>
                        <button onClick={() => setEditing({ id: video.id, title: video.title, thumbnail_url: video.thumbnail_url || '', hls_url: video.hls_url || '', duration: video.duration || '', is_active: video.is_active })}
                          className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => deleteVideo(video.id)} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-card border-t border-border rounded-t-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">{editing.id ? 'Editar Vídeo' : 'Novo Vídeo'}</p>
                <button onClick={() => setEditing(null)} className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Título *</label>
                <input type="text" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Nome do vídeo" className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Thumbnail</label>
                {editing.thumbnail_url ? (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-muted/30 group">
                    <img src={editing.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="h-8 px-3 rounded-md bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-white/30 transition-colors">
                        <Upload className="h-3 w-3" /> Trocar
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          const ext = file.name.split('.').pop();
                          const path = `thumbnails/${Date.now()}.${ext}`;
                          const { error } = await supabase.storage.from('radio-assets').upload(path, file, { upsert: true });
                          if (error) { toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' }); }
                          else {
                            const { data: urlData } = supabase.storage.from('radio-assets').getPublicUrl(path);
                            setEditing({ ...editing, thumbnail_url: urlData.publicUrl });
                          }
                          setUploading(false);
                        }} />
                      </label>
                      <button onClick={() => setEditing({ ...editing, thumbnail_url: '' })}
                        className="h-8 px-3 rounded-md bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-red-500/60 transition-colors">
                        <Trash2 className="h-3 w-3" /> Remover
                      </button>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <label className={`w-full h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}>
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground">Clique para enviar imagem</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const ext = file.name.split('.').pop();
                      const path = `thumbnails/${Date.now()}.${ext}`;
                      const { error } = await supabase.storage.from('radio-assets').upload(path, file, { upsert: true });
                      if (error) { toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' }); }
                      else {
                        const { data: urlData } = supabase.storage.from('radio-assets').getPublicUrl(path);
                        setEditing({ ...editing, thumbnail_url: urlData.publicUrl });
                      }
                      setUploading(false);
                    }} />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">URL do Vídeo (HLS)</label>
                <input type="url" value={editing.hls_url} onChange={e => setEditing({ ...editing, hls_url: e.target.value })}
                  placeholder="https://stream.exemplo.com/video.m3u8" className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">Duração</label>
                  <input type="text" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })}
                    placeholder="1:30:00" className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                <div className="flex items-end pb-0.5">
                  <button onClick={() => setEditing({ ...editing, is_active: !editing.is_active })}
                    className={`h-8 px-3 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${editing.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    {editing.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {editing.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={saveVideo} disabled={saving || !editing.title.trim()}
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

export default AdminVideo;
