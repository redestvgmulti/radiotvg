import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, UserPlus, Trash2, Shield, ShieldCheck, X, Eye, EyeOff, Users, Search, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserItem {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const res = await supabase.functions.invoke('admin-users', { method: 'GET' });
    if (res.error) { toast({ title: 'Erro', description: res.error.message, variant: 'destructive' }); return; }
    setUsers(res.data || []); setLoading(false);
  };

  const createUser = async () => {
    if (!newEmail || !newPassword) return; setCreating(true);
    const res = await supabase.functions.invoke('admin-users', { body: { action: 'create_user', email: newEmail, password: newPassword, role: newRole } });
    if (res.error || res.data?.error) toast({ title: 'Erro', description: res.data?.error || res.error?.message, variant: 'destructive' });
    else { toast({ title: 'Usuário criado!', description: newEmail }); setNewEmail(''); setNewPassword(''); setShowCreate(false); fetchUsers(); }
    setCreating(false);
  };

  const setRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    const res = await supabase.functions.invoke('admin-users', { body: { action: 'set_role', user_id: userId, role } });
    if (res.error || res.data?.error) toast({ title: 'Erro', description: res.data?.error || res.error?.message, variant: 'destructive' });
    else { toast({ title: 'Role atualizada!' }); fetchUsers(); }
    setActionLoading(null);
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${email}?`)) return;
    setActionLoading(userId);
    const res = await supabase.functions.invoke('admin-users', { body: { action: 'delete_user', user_id: userId } });
    if (res.error || res.data?.error) toast({ title: 'Erro', description: res.data?.error || res.error?.message, variant: 'destructive' });
    else { toast({ title: 'Usuário excluído' }); fetchUsers(); }
    setActionLoading(null);
  };

  const formatDate = (d: string | null) => {
    if (!d) return 'Nunca';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button onClick={() => navigate('/admin/dashboard')} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-slate-500 flex items-center justify-center shadow-sm">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Usuários</h1>
            <p className="text-[10px] text-slate-400">Roles e permissões</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="h-8 px-3 rounded-lg bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-700 transition-colors shadow-sm">
          {showCreate ? <X className="h-3.5 w-3.5" /> : <><UserPlus className="h-3.5 w-3.5" /> Novo</>}
        </button>
      </div>

      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Buscar por email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm transition-colors" />
          </div>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-5">
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
                <p className="text-xs font-semibold text-slate-600">Novo Usuário</p>
                <input type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-9 px-3 pr-10 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setNewRole('user')}
                    className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition-colors ${newRole === 'user' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Usuário
                  </button>
                  <button onClick={() => setNewRole('admin')}
                    className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition-colors ${newRole === 'admin' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    Admin
                  </button>
                </div>
                <button onClick={createUser} disabled={creating || !newEmail || !newPassword}
                  className="w-full h-9 rounded-lg bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-slate-700 transition-colors shadow-sm">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Usuário'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">Status / Role</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Último Login</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => u.email.toLowerCase().includes(search.toLowerCase())).map((u, i) => {
                    const isAdmin = u.roles.includes('admin');
                    return (
                      <motion.tr key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                              {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {isAdmin ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-[11px] font-mono text-slate-500">
                          {formatDate(u.last_sign_in_at)}
                        </td>
                        <td className="px-4 py-3 text-right relative">
                          <button onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          <AnimatePresence>
                            {openMenuId === u.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-8 top-10 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 origin-top-right">
                                  <button onClick={() => { setRole(u.id, isAdmin ? 'user' : 'admin'); setOpenMenuId(null); }} disabled={actionLoading === u.id}
                                    className="w-full px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 text-left disabled:opacity-50">
                                    <Shield className="h-3.5 w-3.5" />
                                    {isAdmin ? 'Tornar Usuário' : 'Tornar Admin'}
                                  </button>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button onClick={() => { deleteUser(u.id, u.email || ''); setOpenMenuId(null); }} disabled={actionLoading === u.id}
                                    className="w-full px-3 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 text-left disabled:opacity-50">
                                    <Trash2 className="h-3.5 w-3.5" /> Excluir
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
              {users.filter(u => u.email.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                 <div className="p-8 text-center text-sm text-slate-500">Nenhum usuário encontrado.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsers;
