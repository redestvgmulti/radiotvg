import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Settings, Globe, Share2, Wrench } from 'lucide-react';
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

const categoryMeta: Record<string, { label: string; icon: typeof Settings }> = {
  geral: { label: 'Geral', icon: Settings },
  contato: { label: 'Contato', icon: Globe },
  redes_sociais: { label: 'Redes Sociais', icon: Share2 },
  sistema: { label: 'Sistema', icon: Wrench },
};

const AdminConfig = () => {
  const [settings, setSettings] = useState<RadioSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
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

  const categoryOrder = ['geral', 'contato', 'redes_sociais', 'sistema'];

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
                        {s.key === 'maintenance_mode' ? (
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
