import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Loader2, Power, Pencil, X, Trash2, Upload, ImageIcon, Clock, ExternalLink, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Ad {
  id: string;
  name: string;
  media_url: string;
  media_type: string;
  link_url: string;
  display_duration: number;
  station_ids: string[];
  sort_order: number;
  is_active: boolean;
}

interface Station {
  id: string;
  label: string;
}

const MEDIA_TYPES = ['image', 'video', 'banner'] as const;

const MediaPreview = ({ url, type }: { url: string; type: string }) => {
  if (!url) return <div className="h-10 w-14 rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground/30" /></div>;
  if (type === 'video') return <div className="h-10 w-14 rounded-lg bg-muted flex items-center justify-center"><Film className="h-4 w-4 text-muted-foreground/50" /></div>;
  return <img src={url} alt="" className="h-10 w-14 rounded-lg object-cover border border-border" />;
};

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <div>
    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50" />
  </div>
);

const ImageUploadField = ({ mediaUrl, onUrlChange, uploadKey, label = 'Mídia', uploading, onUpload }: { mediaUrl: string; onUrlChange: (url: string) => void; uploadKey: string; label?: string; uploading: string | null; onUpload: (file: File, key: string) => Promise<string | null> }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">{label}</label>
      {mediaUrl ? (
        <div className="relative inline-block">
          <img src={mediaUrl} alt="" className="h-14 w-auto rounded-xl border border-border object-contain bg-muted/30" />
          <button onClick={() => onUrlChange('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="h-2.5 w-2.5" /></button>
        </div>
      ) : (
        <div className="h-14 w-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/10"><ImageIcon className="h-4 w-4 text-muted-foreground/30" /></div>
      )}
      <input type="file" accept="image/*,video/*" ref={fileRef} className="hidden"
        onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const url = await onUpload(file, uploadKey); if (url) onUrlChange(url); } }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading === uploadKey}
        className="h-8 px-3 rounded-xl bg-muted text-foreground text-[10px] font-semibold flex items-center gap-1 disabled:opacity-60 hover:bg-muted/80 transition-colors">
        {uploading === uploadKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading === uploadKey ? 'Enviando...' : 'Upload'}
      </button>
    </div>
  );
};

const StationSelector = ({ selected, onChange, stations }: { selected: string[]; onChange: (ids: string[]) => void; stations: Station[] }) => {
  const toggleStation = (stationId: string) => {
    return selected.includes(stationId) ? selected.filter(s => s !== stationId) : [...selected, stationId];
  };
  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Estações</label>
      <div className="flex flex-wrap gap-1.5">
        {stations.map(s => (
          <button key={s.id} type="button" onClick={() => onChange(toggleStation(s.id))}
            className={`h-7 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${selected.includes(s.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const AdminAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Ad>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', media_url: '', media_type: 'image', link_url: '', display_duration: 15, station_ids: [] as string[] });
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [adsRes, stationsRes] = await Promise.all([
      supabase.from('ads').select('*').order('sort_order').order('created_at'),
      supabase.from('stream_environments').select('id, label').order('sort_order'),
    ]);
    setAds((adsRes.data as Ad[]) || []);
    setStations((stationsRes.data as Station[]) || []);
    setLoading(false);
  };

  const uploadMedia = async (file: File, key: string): Promise<string | null> => {
    if (file.size > 10 * 1024 * 1024) { toast({ title: 'Erro', description: 'Máximo 10MB.', variant: 'destructive' }); return null; }
    setUploading(key);
    const ext = file.name.split('.').pop() || 'png';
    const path = `ads/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('radio-assets').upload(path, file, { upsert: true });
    if (error) { toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' }); setUploading(null); return null; }
    const { data: urlData } = supabase.storage.from('radio-assets').getPublicUrl(path);
    setUploading(null);
    return urlData.publicUrl;
  };

  const handleCreate = async () => {
    if (!createForm.name) return;
    setCreating(true);
    const { error } = await supabase.from('ads').insert({
      name: createForm.name, media_url: createForm.media_url, media_type: createForm.media_type,
      link_url: createForm.link_url, display_duration: createForm.display_duration,
      station_ids: createForm.station_ids, sort_order: ads.length,
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Anúncio criado!' }); setCreateForm({ name: '', media_url: '', media_type: 'image', link_url: '', display_duration: 15, station_ids: [] }); setShowCreate(false); fetchAll(); }
    setCreating(false);
  };

  const startEdit = (ad: Ad) => { setEditingId(ad.id); setEditForm({ ...ad }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(editingId);
    const { error } = await supabase.from('ads').update({
      name: editForm.name, media_url: editForm.media_url, media_type: editForm.media_type,
      link_url: editForm.link_url, display_duration: editForm.display_duration,
      station_ids: editForm.station_ids, sort_order: editForm.sort_order,
    }).eq('id', editingId);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Salvo!' }); cancelEdit(); fetchAll(); }
    setSaving(null);
  };

  const toggleActive = async (ad: Ad) => {
    setSaving(ad.id);
    await supabase.from('ads').update({ is_active: !ad.is_active }).eq('id', ad.id);
    fetchAll(); setSaving(null);
  };

  const deleteAd = async (ad: Ad) => {
    if (!confirm(`Excluir "${ad.name}"?`)) return;
    setSaving(ad.id);
    await supabase.from('ads').delete().eq('id', ad.id);
    toast({ title: 'Excluído' }); fetchAll(); setSaving(null);
  };


  const getStationNames = (ids: string[]) => ids.map(id => stations.find(s => s.id === id)?.label || '?').join(', ');


  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <button onClick={() => navigate('/admin')} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground">Anúncios</h1>
          <p className="text-xs text-muted-foreground">{ads.filter(a => a.is_active).length} ativos · {ads.length} total</p>
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Novo Anúncio</p>
                <InputField label="Nome" value={createForm.name} onChange={v => setCreateForm({ ...createForm, name: v })} placeholder="Nome do anunciante" />
                <ImageUploadField mediaUrl={createForm.media_url} onUrlChange={url => setCreateForm({ ...createForm, media_url: url })} uploadKey="new-ad" uploading={uploading} onUpload={uploadMedia} />
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Tipo de Mídia</label>
                  <div className="flex gap-1.5">
                    {MEDIA_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => setCreateForm({ ...createForm, media_type: t })}
                        className={`h-7 px-3 rounded-lg text-[10px] font-bold capitalize transition-colors ${createForm.media_type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <InputField label="Link (URL)" value={createForm.link_url} onChange={v => setCreateForm({ ...createForm, link_url: v })} placeholder="https://anunciante.com" type="url" />
                <InputField label="Duração (segundos)" value={String(createForm.display_duration)} onChange={v => setCreateForm({ ...createForm, display_duration: Number(v) || 15 })} type="number" />
                <StationSelector selected={createForm.station_ids} onChange={ids => setCreateForm({ ...createForm, station_ids: ids })} stations={stations} />
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={creating || !createForm.name}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Anúncio'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <ImageIcon className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum anúncio cadastrado.</p>
          </div>
        ) : (
          ads.map((ad, i) => (
            <motion.div key={ad.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border bg-card overflow-hidden ${ad.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <MediaPreview url={ad.media_url} type={ad.media_type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{ad.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded font-medium">{ad.media_type}</span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{ad.display_duration}s</span>
                    {ad.link_url && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 truncate max-w-[80px]"><ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />{ad.link_url.replace(/https?:\/\//, '').split('/')[0]}</span>}
                  </div>
                  {ad.station_ids.length > 0 && (
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5 truncate">{getStationNames(ad.station_ids)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(ad)} disabled={saving === ad.id}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${ad.is_active ? 'text-green-500 hover:bg-green-500/10' : 'text-muted-foreground hover:bg-muted'}`}>
                    <Power className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => editingId === ad.id ? cancelEdit() : startEdit(ad)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    {editingId === ad.id ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => deleteAd(ad)} disabled={saving === ad.id}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {editingId === ad.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border">
                      <InputField label="Nome" value={editForm.name || ''} onChange={v => setEditForm({ ...editForm, name: v })} />
                      <ImageUploadField mediaUrl={editForm.media_url || ''} onUrlChange={url => setEditForm({ ...editForm, media_url: url })} uploadKey={ad.id} uploading={uploading} onUpload={uploadMedia} />
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Tipo de Mídia</label>
                        <div className="flex gap-1.5">
                          {MEDIA_TYPES.map(t => (
                            <button key={t} type="button" onClick={() => setEditForm({ ...editForm, media_type: t })}
                              className={`h-7 px-3 rounded-lg text-[10px] font-bold capitalize transition-colors ${editForm.media_type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <InputField label="Link (URL)" value={editForm.link_url || ''} onChange={v => setEditForm({ ...editForm, link_url: v })} placeholder="https://anunciante.com" type="url" />
                      <InputField label="Duração (segundos)" value={String(editForm.display_duration || 15)} onChange={v => setEditForm({ ...editForm, display_duration: Number(v) || 15 })} type="number" />
                      <InputField label="Ordem" value={String(editForm.sort_order || 0)} onChange={v => setEditForm({ ...editForm, sort_order: Number(v) || 0 })} type="number" />
                      <StationSelector selected={editForm.station_ids || []} onChange={ids => setEditForm({ ...editForm, station_ids: ids })} stations={stations} />
                      <motion.button whileTap={{ scale: 0.98 }} onClick={saveEdit} disabled={saving === ad.id}
                        className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {saving === ad.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Salvar</>}
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

export default AdminAds;
