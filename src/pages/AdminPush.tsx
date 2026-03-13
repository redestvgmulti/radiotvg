import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Bell, Save, Loader2, Upload, X, Image as ImageIcon, Send, Users, Clock, CheckCircle, XCircle, History, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const inputClass = "w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors";
const textareaClass = "w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none";
const selectClass = "w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none";

const TARGET_OPTIONS = [
  { value: 'all', label: 'Todos os inscritos', desc: 'Envia para todos que aceitaram notificações' },
  { value: 'active', label: 'Usuários ativos', desc: 'Apenas quem acessou recentemente' },
  { value: 'inactive', label: 'Usuários inativos', desc: 'Quem não acessa há algum tempo' },
];

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Enviar apenas uma vez', desc: 'Recomendado para avisos pontuais' },
  { value: 'daily', label: 'Diariamente', desc: 'Máx. 1x ao dia — use com moderação' },
  { value: 'weekly', label: 'Semanalmente', desc: 'Recomendado — bom equilíbrio de engajamento' },
  { value: 'biweekly', label: 'A cada 2 semanas', desc: 'Ideal para promoções e novidades' },
  { value: 'monthly', label: 'Mensalmente', desc: 'Baixa frequência, maior retenção' },
];

interface DropZoneProps {
  label: string;
  dimensions: string;
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  folder: string;
}

const DropZone = ({ label, dimensions, value, onChange, bucket, folder }: DropZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Apenas imagens são permitidas', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Erro ao enviar', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(urlData.publicUrl);
    setUploading(false);
  }, [bucket, folder, onChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 block">{label}</label>
      <p className="text-[10px] text-slate-400">Dimensões recomendadas: <span className="font-semibold text-slate-500">{dimensions}</span></p>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt={label} className="w-full h-32 object-contain bg-white" />
          <button onClick={() => onChange('')} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative rounded-lg border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors cursor-pointer ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-slate-300" />
              <p className="text-xs text-slate-400">Arraste uma imagem ou clique para enviar</p>
              <p className="text-[10px] text-slate-300">{dimensions}</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}
    </div>
  );
};

interface PushRecord {
  id: string;
  title: string;
  message: string;
  target: string;
  recipients: number;
  status: string;
  created_at: string;
}

const TARGET_LABELS: Record<string, string> = {
  all: 'Todos',
  active: 'Ativos',
  inactive: 'Inativos',
};

const AdminPush = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [linkUrl, setLinkUrl] = useState('');
  const [target, setTarget] = useState('all');
  const [history, setHistory] = useState<PushRecord[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [resending, setResending] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const fetchHistory = async (page = 0) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from('push_history')
      .select('id, title, message, target, recipients, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (data) setHistory(data as PushRecord[]);
    if (count !== null) setHistoryTotal(count);
    setHistoryPage(page);
  };

  const handleResend = async (h: PushRecord) => {
    if (!confirm(`Reenviar "${h.title}" para ${TARGET_LABELS[h.target] || h.target}?`)) return;
    setResending(h.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: { title: h.title, message: h.message, target: h.target },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: '🚀 Push reenviada!', description: `${data?.recipients || 0} destinatário(s).` });
      await fetchHistory(historyPage);
    } catch (err: any) {
      toast({ title: 'Erro ao reenviar', description: err.message, variant: 'destructive' });
      await fetchHistory(historyPage);
    } finally {
      setResending(null);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('radio_settings')
        .select('key, value')
        .in('key', ['push_title', 'push_message', 'push_icon_url', 'push_image_url', 'push_frequency', 'push_link_url']);
      if (data) {
        data.forEach(r => {
          if (r.key === 'push_title') setTitle(r.value);
          if (r.key === 'push_message') setMessage(r.value);
          if (r.key === 'push_icon_url') setIconUrl(r.value);
          if (r.key === 'push_image_url') setImageUrl(r.value);
          if (r.key === 'push_frequency') setFrequency(r.value);
          if (r.key === 'push_link_url') setLinkUrl(r.value);
        });
      }
      await fetchHistory();
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) return toast({ title: 'Título obrigatório', variant: 'destructive' });
    if (!message.trim()) return toast({ title: 'Mensagem obrigatória', variant: 'destructive' });

    setSaving(true);
    const settings = [
      { key: 'push_title', value: title, label: 'Título da Push', category: 'push' },
      { key: 'push_message', value: message, label: 'Mensagem da Push', category: 'push' },
      { key: 'push_icon_url', value: iconUrl, label: 'Ícone da Push', category: 'push' },
      { key: 'push_image_url', value: imageUrl, label: 'Imagem da Push', category: 'push' },
      { key: 'push_frequency', value: frequency, label: 'Frequência da Push', category: 'push' },
      { key: 'push_link_url', value: linkUrl, label: 'Link da Push', category: 'push' },
    ];

    for (const s of settings) {
      const { data: existing } = await supabase.from('radio_settings').select('id').eq('key', s.key).maybeSingle();
      if (existing) {
        await supabase.from('radio_settings').update({ value: s.value }).eq('key', s.key);
      } else {
        await supabase.from('radio_settings').insert(s);
      }
    }

    setSaving(false);
    toast({ title: 'Configuração de push salva!' });
  };

  const handleSendNow = async () => {
    if (!title.trim()) return toast({ title: 'Título obrigatório', variant: 'destructive' });
    if (!message.trim()) return toast({ title: 'Mensagem obrigatória', variant: 'destructive' });

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: {
          title,
          message,
          icon_url: iconUrl || undefined,
          image_url: imageUrl || undefined,
          link_url: linkUrl || undefined,
          target,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: '🚀 Push enviada com sucesso!',
        description: `Enviada para ${data?.recipients || 0} dispositivo(s).`,
      });
      await fetchHistory(0);
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar push',
        description: err.message || 'Tente novamente',
        variant: 'destructive',
      });
      await fetchHistory(0);
    } finally {
      setSending(false);
    }
  };

  const selectedFreq = FREQUENCY_OPTIONS.find(f => f.value === frequency);
  const selectedTarget = TARGET_OPTIONS.find(t => t.value === target);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin/dashboard')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-sm">
            <Bell className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Mensagem Push</h1>
            <p className="text-[10px] text-slate-400">Configurar e enviar notificações push</p>
          </div>
        </div>
      </div>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 space-y-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Title & Message */}
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Título da notificação</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="🎵 Novidade na Rádio TVG!" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Mensagem</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Não perca nosso programa especial hoje às 20h!" rows={3} className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Link ao clicar (opcional)</label>
                <p className="text-[10px] text-slate-400 -mt-1">URL aberta ao clicar na notificação. Deixe vazio para abrir o app.</p>
                <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://radiotvg.lovable.app" className={inputClass} />
              </div>
            </div>

            {/* Images */}
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700">Imagens</span>
              </div>

              <DropZone
                label="Ícone da notificação"
                dimensions="192 × 192 px (quadrado, PNG)"
                value={iconUrl}
                onChange={setIconUrl}
                bucket="radio-assets"
                folder="push-icons"
              />

              <DropZone
                label="Imagem grande (banner)"
                dimensions="720 × 360 px (2:1, PNG ou JPG)"
                value={imageUrl}
                onChange={setImageUrl}
                bucket="radio-assets"
                folder="push-images"
              />
            </div>

            {/* Target & Frequency */}
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 space-y-5">
              {/* Target */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <label className="text-xs font-semibold text-slate-700">Público-alvo</label>
                </div>
                <div className="grid gap-2">
                  {TARGET_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        target === opt.value
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="target"
                        value={opt.value}
                        checked={target === opt.value}
                        onChange={() => setTarget(opt.value)}
                        className="accent-indigo-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{opt.label}</p>
                        <p className="text-[10px] text-slate-400">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block">Frequência de envio automático</label>
                <p className="text-[10px] text-slate-400 -mt-1">
                  ⚡ Boas práticas: enviar no máximo 1 push por semana para evitar desinscrições.
                </p>
                <select value={frequency} onChange={e => setFrequency(e.target.value)} className={selectClass}>
                  {FREQUENCY_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                {selectedFreq && (
                  <p className="text-[10px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    💡 {selectedFreq.desc}
                  </p>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">Pré-visualização</label>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {iconUrl ? (
                    <img src={iconUrl} alt="icon" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{title || 'Título da notificação'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{message || 'Mensagem da notificação'}</p>
                  </div>
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="push banner" className="w-full h-32 object-cover rounded-lg mt-3" />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Send Now */}
              <button
                onClick={handleSendNow}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full h-11 rounded-lg bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? 'Enviando...' : `Enviar agora para ${selectedTarget?.label || 'todos'}`}
              </button>

              {/* Save config */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-10 rounded-lg bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar configuração
              </button>
            </div>

            {/* Push History */}
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700">Histórico de envios</span>
                <span className="text-[10px] text-slate-400 ml-auto">{historyTotal} registro(s)</span>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-6 w-6 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Nenhum envio registrado ainda.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {history.map(h => (
                      <div key={h.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                        <div className="mt-0.5">
                          {h.status === 'sent' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{h.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{h.message}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Users className="h-2.5 w-2.5" />
                              {TARGET_LABELS[h.target] || h.target}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Send className="h-2.5 w-2.5" />
                              {h.recipients} destinatário(s)
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(h.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            h.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {h.status === 'sent' ? 'Enviado' : 'Falhou'}
                          </span>
                          <button
                            onClick={() => handleResend(h)}
                            disabled={resending === h.id}
                            className="h-6 px-2 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold flex items-center gap-1 hover:bg-indigo-100 hover:text-indigo-600 transition-colors disabled:opacity-50"
                          >
                            {resending === h.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <RefreshCw className="h-2.5 w-2.5" />}
                            Reenviar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {historyTotal > PAGE_SIZE && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => fetchHistory(historyPage - 1)}
                        disabled={historyPage === 0}
                        className="h-8 px-3 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors disabled:opacity-40"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                      </button>
                      <span className="text-[10px] text-slate-400">
                        Página {historyPage + 1} de {Math.ceil(historyTotal / PAGE_SIZE)}
                      </span>
                      <button
                        onClick={() => fetchHistory(historyPage + 1)}
                        disabled={(historyPage + 1) * PAGE_SIZE >= historyTotal}
                        className="h-8 px-3 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors disabled:opacity-40"
                      >
                        Próxima <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminPush;
