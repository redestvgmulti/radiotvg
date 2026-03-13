import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface VoucherRow {
  id: string;
  protocol_number: string;
  voucher_code: string;
  points_spent: number;
  status: string;
  created_at: string;
  redeemed_at: string | null;
  user_id: string;
  reward_id: string;
  profiles: { display_name: string } | null;
  rewards: { name: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Ativo', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  redeemed: { label: 'Utilizado', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  expired: { label: 'Expirado', className: 'bg-muted text-muted-foreground border-border' },
  cancelled: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchVouchers = async () => {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*, profiles!vouchers_user_id_fkey(display_name), rewards!vouchers_reward_id_fkey(name)')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback without join alias
      const { data: fallback } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });
      setVouchers((fallback as any[])?.map(v => ({ ...v, profiles: null, rewards: null })) || []);
    } else {
      setVouchers((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVouchers(); }, []);

  const updateStatus = async (id: string, status: 'redeemed' | 'cancelled') => {
    setActing(id);
    const updateData: any = { status };
    if (status === 'redeemed') {
      updateData.redeemed_at = new Date().toISOString();
      updateData.redeemed_by = user?.id;
    }

    const { error } = await supabase.from('vouchers').update(updateData).eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: status === 'redeemed' ? 'Marcado como Utilizado' : 'Voucher Cancelado' });
      fetchVouchers();
    }
    setActing(null);
  };

  const exportCSV = async () => {
    const { data, error } = await supabase.rpc('get_voucher_export');
    if (error || !data) {
      toast({ title: 'Erro ao exportar', variant: 'destructive' });
      return;
    }
    const rows = data as any[];
    const headers = ['Protocolo', 'Voucher', 'Nome', 'Email', 'Recompensa', 'Pontos', 'Status', 'Criado em', 'Utilizado em'];
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        r.protocol_number, r.voucher_code, `"${r.display_name}"`, r.email,
        `"${r.reward_name}"`, r.points_spent, r.status,
        new Date(r.created_at).toLocaleDateString('pt-BR'),
        r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString('pt-BR') : '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-display font-bold text-foreground">Vouchers</h1>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground hover:bg-card/80">
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-border">
          <Ticket className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Nenhum voucher gerado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vouchers.map(v => {
            const st = STATUS_LABELS[v.status] || STATUS_LABELS.pending;
            return (
              <div key={v.id} className="rounded-xl bg-card border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-foreground">{v.voucher_code}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${st.className}`}>{st.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">{v.protocol_number}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{(v.profiles as any)?.display_name || 'Usuário'}</span>
                      <span>•</span>
                      <span>{(v.rewards as any)?.name || 'Recompensa'}</span>
                      <span>•</span>
                      <span>{v.points_spent} pts</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60">
                      {new Date(v.created_at).toLocaleDateString('pt-BR')}
                      {v.redeemed_at && ` • Utilizado em ${new Date(v.redeemed_at).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>

                  {v.status === 'pending' && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateStatus(v.id, 'redeemed')}
                        disabled={acting === v.id}
                        className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 disabled:opacity-50"
                        title="Marcar como Utilizado">
                        {acting === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateStatus(v.id, 'cancelled')}
                        disabled={acting === v.id}
                        className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                        title="Cancelar">
                        <XCircle className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminVouchers;
