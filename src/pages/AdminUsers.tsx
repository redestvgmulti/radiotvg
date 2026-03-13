import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, UserPlus, Trash2, Shield, ShieldCheck, X, Eye, EyeOff, Users } from 'lucide-react';
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

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6">
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
          <div className="space-y-3">
            {users.map((u, i) => {
              const isAdmin = u.roles.includes('admin');
              return (
                <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                      {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {isAdmin ? 'Admin' : 'Usuário'}
                        </span>
                        <span className="text-[10px] text-slate-400">Último login: {formatDate(u.last_sign_in_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button onClick={() => setRole(u.id, isAdmin ? 'user' : 'admin')} disabled={actionLoading === u.id}
                      className="flex-1 h-8 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                      {actionLoading === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Shield className="h-3 w-3" />{isAdmin ? 'Tornar Usuário' : 'Tornar Admin'}</>}
                    </button>
                    <button onClick={() => deleteUser(u.id, u.email || '')} disabled={actionLoading === u.id}
                      className="h-8 px-3 rounded-lg text-[11px] font-semibold bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                      <Trash2 className="h-3 w-3" />
                    </button>
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

export default AdminUsers;
