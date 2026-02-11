import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Settings, Globe, Share2, Wrench, ImageIcon, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RadioSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  category: string;
}

const IMAGE_KEYS = ['logo_url', 'hero_image_url', 'favicon_url'];

const categoryMeta: Record<string, { label: string; icon: typeof Settings }> = {
  geral: { label: 'Geral', icon: Settings },
  imagens: { label: 'Imagens', icon: ImageIcon },
  contato: { label: 'Contato', icon: Globe },
  redes_sociais: { label: 'Redes Sociais', icon: Share2 },
  sistema: { label: 'Sistema', icon: Wrench },
};

const AdminConfig = () => {
  const [settings, setSettings] = useState<RadioSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('radio_settings')
      .select('*')
      .order('category')
      .order('key');

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    setSettings(data || []);
    setLoading(false);
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const getValue = (s: RadioSetting) =>
    editedValues[s.key] !== undefined ? editedValues[s.key] : s.value;

  const hasChanges = Object.keys(editedValues).length > 0;

  const handleImageUpload = async (settingKey: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erro', description: 'Selecione um arquivo de imagem.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'Imagem deve ter no máximo 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(settingKey);
    const ext = file.name.split('.').pop() || 'png';
    const filePath = `${settingKey}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('radio-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Erro no upload', description: uploadError.message, variant: 'destructive' });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('radio-assets')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Save directly to DB
    const { error: updateError } = await supabase
      .from('radio_settings')
      .update({ value: publicUrl })
      .eq('key', settingKey);

    if (updateError) {
      toast({ title: 'Erro ao salvar', description: updateError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Upload concluído!', description: 'Imagem atualizada.' });
      // Remove from edited if present
      setEditedValues((prev) => {
        const next = { ...prev };
        delete next[settingKey];
        return next;
      });
      fetchSettings();
    }
    setUploading(null);
  };

  const removeImage = async (settingKey: string) => {
    const { error } = await supabase
      .from('radio_settings')
      .update({ value: '' })
      .eq('key', settingKey);

    if (!error) {
      toast({ title: 'Imagem removida' });
      fetchSettings();
    }
  };

  const saveAll = async () => {
    setSaving(true);
    const updates = Object.entries(editedValues).map(([key, value]) =>
      supabase.from('radio_settings').update({ value }).eq('key', key)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    if (failed?.error) {
      toast({ title: 'Erro ao salvar', description: failed.error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Salvo!', description: 'Configurações atualizadas.' });
      setEditedValues({});
      fetchSettings();
    }
    setSaving(false);
  };

  // Group settings by category
  const grouped = settings.reduce<Record<string, RadioSetting[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const categoryOrder = ['geral', 'imagens', 'contato', 'redes_sociais', 'sistema'];

  const renderImageField = (s: RadioSetting) => {
    const currentUrl = getValue(s);
    const isUploading = uploading === s.key;

    return (
      <div className="space-y-2">
        {currentUrl ? (
          <div className="relative inline-block">
            <img
              src={currentUrl}
              alt={s.label}
              className="h-20 w-auto rounded-xl border border-border object-contain bg-muted/30"
            />
            <button
              onClick={() => removeImage(s.key)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-20 w-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/10">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={(el) => { fileInputRefs.current[s.key] = el; }}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(s.key, file);
          }}
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => fileInputRefs.current[s.key]?.click()}
          disabled={isUploading}
          className="h-9 px-4 rounded-xl bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 transition-colors hover:bg-muted/80"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {isUploading ? 'Enviando...' : currentUrl ? 'Trocar imagem' : 'Fazer upload'}
        </motion.button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <button
          onClick={() => navigate('/admin')}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-display font-bold text-foreground">Configurações</h1>
          <p className="text-xs text-muted-foreground">Settings gerais da rádio</p>
        </div>
        {hasChanges && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveAll}
            disabled={saving}
            className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Salvar
          </motion.button>
        )}
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 py-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items) return null;
              const meta = categoryMeta[cat] || { label: cat, icon: Settings };
              const Icon = meta.icon;

              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                      {meta.label}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
                    {items.map((s) => (
                      <div key={s.id} className="px-4 py-3">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          {s.label}
                        </label>
                        {IMAGE_KEYS.includes(s.key) ? (
                          renderImageField(s)
                        ) : s.key === 'maintenance_mode' ? (
                          <button
                            onClick={() =>
                              handleChange(s.key, getValue(s) === 'true' ? 'false' : 'true')
                            }
                            className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${
                              getValue(s) === 'true'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-green-500/10 text-green-600'
                            }`}
                          >
                            {getValue(s) === 'true' ? 'Ativado' : 'Desativado'}
                          </button>
                        ) : (
                          <input
                            type="text"
                            value={getValue(s)}
                            onChange={(e) => handleChange(s.key, e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminConfig;
