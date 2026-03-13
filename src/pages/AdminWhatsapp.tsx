import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Save, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const inputClass = "w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors";
const textareaClass = "w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none";

const AdminWhatsapp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('radio_settings')
        .select('key, value')
        .in('key', ['whatsapp_number', 'whatsapp_message']);
      if (data) {
        data.forEach(r => {
          if (r.key === 'whatsapp_number') setNumber(r.value);
          if (r.key === 'whatsapp_message') setMessage(r.value);
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Upsert both settings
    const upserts = [
      { key: 'whatsapp_number', value: number.replace(/\D/g, ''), label: 'Número do WhatsApp', category: 'whatsapp' },
      { key: 'whatsapp_message', value: message, label: 'Mensagem do WhatsApp', category: 'whatsapp' },
    ];
    for (const u of upserts) {
      const { data: existing } = await supabase.from('radio_settings').select('id').eq('key', u.key).maybeSingle();
      if (existing) {
        await supabase.from('radio_settings').update({ value: u.value }).eq('key', u.key);
      } else {
        await supabase.from('radio_settings').insert(u);
      }
    }
    setSaving(false);
    toast({ title: 'Configurações salvas!' });
  };

  const cleanNumber = number.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const previewLink = cleanNumber
    ? `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`
    : '';

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin/dashboard')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">WhatsApp</h1>
            <p className="text-[10px] text-slate-400">Configurar link e mensagem</p>
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
            {/* Number */}
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">Número do WhatsApp</label>
              <p className="text-[10px] text-slate-400 -mt-1">Inclua o código do país. Ex: 5511999999999</p>
              <input
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="5511999999999"
                className={inputClass}
              />
            </div>

            {/* Message */}
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">Mensagem de saudação</label>
              <p className="text-[10px] text-slate-400 -mt-1">Mensagem pré-preenchida quando o ouvinte clicar no botão</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Olá! Estou ouvindo a Rádio TVG 🎶"
                rows={3}
                className={textareaClass}
              />
            </div>

            {/* Preview */}
            {previewLink && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 space-y-3">
                <label className="text-xs font-semibold text-slate-700 block">Pré-visualização do link</label>
                <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-2">
                  <p className="text-xs text-slate-600 flex-1 truncate font-mono">{previewLink}</p>
                  <a href={previewLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-10 rounded-lg bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default AdminWhatsapp;
