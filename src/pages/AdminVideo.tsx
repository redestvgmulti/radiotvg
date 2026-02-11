import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Video, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RadioSetting {
  id: string;
  key: string;
  value: string;
  label: string;
}

const AdminVideo = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [originalLive, setOriginalLive] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('radio_settings')
        .select('*')
        .in('key', ['video_stream_url', 'video_is_live']);

      if (data) {
        const urlSetting = data.find(s => s.key === 'video_stream_url');
        const liveSetting = data.find(s => s.key === 'video_is_live');
        const url = urlSetting?.value || '';
        const live = liveSetting?.value === 'true';
        setVideoUrl(url);
        setIsLive(live);
        setOriginalUrl(url);
        setOriginalLive(live);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const hasChanges = videoUrl !== originalUrl || isLive !== originalLive;

  const save = async () => {
    setSaving(true);
    const updates = [
      supabase.from('radio_settings').update({ value: videoUrl }).eq('key', 'video_stream_url'),
      supabase.from('radio_settings').update({ value: isLive ? 'true' : 'false' }).eq('key', 'video_is_live'),
    ];
    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed?.error) {
      toast({ title: 'Erro', description: failed.error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Salvo!' });
      setOriginalUrl(videoUrl);
      setOriginalLive(isLive);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate('/admin')} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Vídeo / Live</h1>
          <p className="text-[10px] text-muted-foreground">Gerenciar stream de vídeo</p>
        </div>
        {hasChanges && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={save} disabled={saving}
            className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Salvar
          </motion.button>
        )}
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {/* LIVE Toggle */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Transmissão ao Vivo</p>
                  <p className="text-[10px] text-muted-foreground">Ativar/desativar badge LIVE no app</p>
                </div>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`h-8 px-3 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isLive ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Circle className={`h-2 w-2 fill-current ${isLive ? 'animate-pulse' : ''}`} />
                  {isLive ? 'LIVE' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Video Stream URL */}
            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">URL do Stream de Vídeo (HLS)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://stream.exemplo.com/video.m3u8"
                className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              {videoUrl && (
                <div className="flex items-center gap-1.5">
                  <Video className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground truncate">{videoUrl}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminVideo;
