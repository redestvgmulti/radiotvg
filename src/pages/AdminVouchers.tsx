import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Download, Loader2, CheckCircle, XCircle, ArrowLeft, Search, MoreVertical } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<VoucherRow | null>(null);
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

  const updateStatus = async (id: string, status: string) => {
    setActing(id);
    const updateData: any = { status };
    if (status === 'redeemed') { updateData.redeemed_at = new Date().toISOString(); updateData.redeemed_by = user?.id; }
    else if (status === 'pending') { updateData.redeemed_at = null; updateData.redeemed_by = null; }

    const { error } = await supabase.from('vouchers').update(updateData).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Status Atualizado!' }); fetchVouchers(); }
    setActing(null);
  };

  const deleteVoucher = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir permanentemente este voucher?')) return;
    setActing(id);
    const { error } = await supabase.from('vouchers').delete().eq('id', id);
    if (error) toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Voucher Excluído' }); fetchVouchers(); }
    setActing(null);
  };

  const saveVoucherEdit = async () => {
    if (!editingVoucher) return;
    setActing(editingVoucher.id);
    const { error } = await supabase.from('vouchers').update({
      voucher_code: editingVoucher.voucher_code,
      points_spent: editingVoucher.points_spent
    }).eq('id', editingVoucher.id);

    if (error) toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Voucher atualizado' }); setEditingVoucher(null); fetchVouchers(); }
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

      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Buscar por voucher, e-mail ou recompensa..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm transition-colors" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white border border-dashed border-slate-200">
            <Ticket className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum voucher gerado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-4 py-3">Código / E-mail</th>
                    <th className="px-4 py-3">Recompensa</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vouchers.filter(v => 
                    (v.email || '').toLowerCase().includes(search.toLowerCase()) || 
                    (v.voucher_code || '').toLowerCase().includes(search.toLowerCase()) ||
                    (v.reward_name || '').toLowerCase().includes(search.toLowerCase())
                  ).map((v, i) => {
                    const st = STATUS_LABELS[v.status] || STATUS_LABELS.pending;
                    return (
                      <motion.tr key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 font-mono">{v.voucher_code}</span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[150px]">{v.email || 'Email não disponível'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">{v.reward_name || 'Recompensa Excluída'}</span>
                            <span className="text-[10px] font-bold text-emerald-600">{v.points_spent} pts</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-1">Gerado: {new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
                        </td>
                        <td className="px-4 py-3 text-right relative">
                          <span className={`sm:hidden text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${st.bg} ${st.text} block mb-2 w-max ml-auto opacity-70`}>
                            {st.label}
                          </span>
                          <button onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          <AnimatePresence>
                            {openMenuId === v.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 origin-top-right">
                                  
                                  {v.status === 'pending' && (
                                    <>
                                      <button onClick={() => { updateStatus(v.id, 'redeemed'); setOpenMenuId(null); }} disabled={acting === v.id}
                                        className="w-full px-3 py-2 text-[11px] font-medium text-blue-700 hover:bg-blue-50 flex items-center gap-2 text-left disabled:opacity-50">
                                        <CheckCircle className="h-3.5 w-3.5" /> Marcar como Utilizado
                                      </button>
                                      <div className="h-px bg-slate-100 my-1" />
                                    </>
                                  )}

                                  {(v.status === 'cancelled' || v.status === 'redeemed' || v.status === 'expired') && (
                                    <>
                                      <button onClick={() => { updateStatus(v.id, 'pending'); setOpenMenuId(null); }} disabled={acting === v.id}
                                        className="w-full px-3 py-2 text-[11px] font-medium text-green-700 hover:bg-green-50 flex items-center gap-2 text-left disabled:opacity-50">
                                        <CheckCircle className="h-3.5 w-3.5" /> Ativar (Voltar p/ Ativo)
                                      </button>
                                      <div className="h-px bg-slate-100 my-1" />
                                    </>
                                  )}

                                  {v.status !== 'cancelled' && (
                                    <>
                                      <button onClick={() => { updateStatus(v.id, 'cancelled'); setOpenMenuId(null); }} disabled={acting === v.id}
                                        className="w-full px-3 py-2 text-[11px] font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2 text-left disabled:opacity-50">
                                        <XCircle className="h-3.5 w-3.5" /> Desativar / Cancelar
                                      </button>
                                      <div className="h-px bg-slate-100 my-1" />
                                    </>
                                  )}

                                  <button onClick={() => { setEditingVoucher(v); setOpenMenuId(null); }}
                                    className="w-full px-3 py-2 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 text-left disabled:opacity-50">
                                    <Ticket className="h-3.5 w-3.5" /> Editar Informações
                                  </button>
                                  <div className="h-px bg-slate-100 my-1" />

                                  <button onClick={() => { deleteVoucher(v.id); setOpenMenuId(null); }} disabled={acting === v.id}
                                    className="w-full px-3 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 text-left disabled:opacity-50">
                                    <XCircle className="h-3.5 w-3.5" /> Excluir
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {vouchers.filter(v => (v.email || '').toLowerCase().includes(search.toLowerCase()) || (v.voucher_code || '').toLowerCase().includes(search.toLowerCase()) || (v.reward_name || '').toLowerCase().includes(search.toLowerCase())).length === 0 && (
                 <div className="p-8 text-center text-sm text-slate-500">Nenhum voucher encontrado.</div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {editingVoucher && (
            <>
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setEditingVoucher(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-100">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-800">Editar Voucher</h3>
                  <button onClick={() => setEditingVoucher(null)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><XCircle className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Novo Código / Nome do Voucher</label>
                    <input type="text" value={editingVoucher.voucher_code} onChange={e => setEditingVoucher({ ...editingVoucher, voucher_code: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Pontos Gastos</label>
                    <input type="number" value={editingVoucher.points_spent} onChange={e => setEditingVoucher({ ...editingVoucher, points_spent: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono" />
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-amber-800 text-xs">
                    <strong>Nota:</strong> Informações como Nome de Usuário, E-mail ou Título da Recompensa devem ser editadas nas suas respectivas abas (Usuários ou Recompensas). Aqui modificamos o registro do uso do voucher em si.
                  </div>
                  <button onClick={saveVoucherEdit} disabled={acting === editingVoucher.id}
                    className="w-full h-11 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center">
                    {acting === editingVoucher.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Informações'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminVouchers;
