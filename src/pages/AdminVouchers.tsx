import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Download, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface VoucherRow {
  id: string;
  protocol_number: string;
  voucher_code: string;
  display_name: string;
  email: string;
  reward_name: string;
  points_spent: number;
  status: string;
  created_at: string;
  redeemed_at: string | null;
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Ativo', bg: 'bg-green-100', text: 'text-green-700' },
  redeemed: { label: 'Utilizado', bg: 'bg-blue-100', text: 'text-blue-700' },
  expired: { label: 'Expirado', bg: 'bg-slate-100', text: 'text-slate-500' },
  cancelled: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-600' },
};

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchVouchers = async () => {
    const { data, error } = await supabase.rpc('get_admin_vouchers');
    if (error) {
      toast({ title: 'Erro ao carregar vouchers', description: error.message, variant: 'destructive' });
      setVouchers([]);
    } else {
      setVouchers((data as VoucherRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVouchers(); }, []);

  const updateStatus = async (id: string, status: 'redeemed' | 'cancelled') => {
    setActing(id);
    const updateData: any = { status };
    if (status === 'redeemed') { updateData.redeemed_at = new Date().toISOString(); updateData.redeemed_by = user?.id; }
    const { error } = await supabase.from('vouchers').update(updateData).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: status === 'redeemed' ? 'Marcado como Utilizado' : 'Voucher Cancelado' }); fetchVouchers(); }
    setActing(null);
  };

  const exportCSV = async () => {
    const { data, error } = await supabase.rpc('get_voucher_export');
    if (error || !data) { toast({ title: 'Erro ao exportar', variant: 'destructive' }); return; }
    const rows = data as any[];
    const headers = ['Protocolo', 'Voucher', 'Nome', 'Email', 'Recompensa', 'Pontos', 'Status', 'Criado em', 'Utilizado em'];
    const csv = [headers.join(','), ...rows.map(r => [r.protocol_number, r.voucher_code, `"${r.display_name}"`, r.email, `"${r.reward_name}"`, r.points_spent, r.status, new Date(r.created_at).toLocaleDateString('pt-BR'), r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString('pt-BR') : ''].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `vouchers-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin/dashboard')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
            <Ticket className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Vouchers</h1>
            <p className="text-[10px] text-slate-400">Gestão de vouchers</p>
          </div>
        </div>
        <button onClick={exportCSV}
          className="h-8 px-3 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-200 transition-colors">
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </button>
      </div>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white border border-dashed border-slate-200">
            <Ticket className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum voucher gerado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vouchers.map((v, i) => {
              const st = STATUS_LABELS[v.status] || STATUS_LABELS.pending;
              return (
                <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-slate-800">{v.voucher_code}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{v.protocol_number}</p>
                      <div className="flex flex-col gap-0.5 mt-1 border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs">
                           <span className="font-semibold text-slate-700">{v.display_name || 'Sem nome'}</span>
                           <span className="text-slate-500 text-[10px]">{v.email || 'Email não disponível'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 mt-1 border-t border-slate-100">
                          <span className="font-medium text-slate-600 truncate">{v.reward_name || 'Recompensa Excluída'}</span>
                          <span className="shrink-0 ml-2 font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{v.points_spent} pts</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1">
                        Gerado em {new Date(v.created_at).toLocaleString('pt-BR')}
                        {v.redeemed_at && ` · Utilizado em ${new Date(v.redeemed_at).toLocaleString('pt-BR')}`}
                      </p>
                    </div>

                    {v.status === 'pending' && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => updateStatus(v.id, 'redeemed')} disabled={acting === v.id}
                          className="h-8 w-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 flex items-center justify-center transition-colors"
                          title="Marcar como Utilizado">
                          {acting === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button onClick={() => updateStatus(v.id, 'cancelled')} disabled={acting === v.id}
                          className="h-8 w-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                          title="Cancelar">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminVouchers;
