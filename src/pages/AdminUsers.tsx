import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, UserPlus, Trash2, Shield, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await supabase.functions.invoke('admin-users', {
      method: 'GET',
    });

    if (res.error) {
      toast({ title: 'Erro', description: res.error.message, variant: 'destructive' });
      return;
    }
    setUsers(res.data || []);
    setLoading(false);
  };

  const createUser = async () => {
    if (!newEmail || !newPassword) return;
    setCreating(true);

    const res = await supabase.functions.invoke('admin-users', {
      body: { action: 'create_user', email: newEmail, password: newPassword, role: newRole },
    });

    if (res.error || res.data?.error) {
      toast({ title: 'Erro', description: res.data?.error || res.error?.message, variant: 'destructive' });
    } else {
      toast({ title: 'Usuário criado!', description: newEmail });
      setNewEmail('');
      setNewPassword('');
      setShowCreate(false);
      fetchUsers();
    }
    setCreating(false);
  };

  const setRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    const res = await supabase.functions.invoke('admin-users', {
      body: { action: 'set_role', user_id: userId, role },
    });

    if (res.error || res.data?.error) {
      toast({ title: 'Erro', description: res.data?.error || res.error?.message, variant: 'destructive' });
    } else {
      toast({ title: 'Role atualizada!' });
      fetchUsers();
    }
    setActionLoading(null);
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${email}?`)) return;
    setActionLoading(userId);

    const res = await supabase.functions.invoke('admin-users', {
      body: { action: 'delete_user', user_id: userId },
    });

    if (res.error || res.data?.error) {
      toast({ title: 'Erro', description: res.data?.error || res.error?.message, variant: 'destructive' });
    } else {
      toast({ title: 'Usuário excluído' });
      fetchUsers();
    }
    setActionLoading(null);
  };

  const formatDate = (d: string | null) => {
    if (!d) return 'Nunca';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
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
          <h1 className="text-base font-display font-bold text-foreground">Usuários</h1>
          <p className="text-xs text-muted-foreground">Gerenciar permissões e roles</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(!showCreate)}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
        >
          {showCreate ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        </motion.button>
      </header>

      <div className="max-w-lg mx-auto px-5 py-5">
        {/* Create user form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Novo Usuário</p>
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewRole('user')}
                    className={`flex-1 h-9 rounded-xl text-xs font-semibold border transition-colors ${newRole === 'user' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground'}`}
                  >
                    Usuário
                  </button>
                  <button
                    onClick={() => setNewRole('admin')}
                    className={`flex-1 h-9 rounded-xl text-xs font-semibold border transition-colors ${newRole === 'admin' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground'}`}
                  >
                    Admin
                  </button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={createUser}
                  disabled={creating || !newEmail || !newPassword}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Usuário'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u, i) => {
              const isAdmin = u.roles.includes('admin');
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-card border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                      {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                          {isAdmin ? 'Admin' : 'Usuário'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Último login: {formatDate(u.last_sign_in_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => setRole(u.id, isAdmin ? 'user' : 'admin')}
                      disabled={actionLoading === u.id}
                      className="flex-1 h-8 rounded-lg text-[11px] font-semibold bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoading === u.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Shield className="h-3 w-3" />
                          {isAdmin ? 'Tornar Usuário' : 'Tornar Admin'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id, u.email || '')}
                      disabled={actionLoading === u.id}
                      className="h-8 px-3 rounded-lg text-[11px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
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

export default AdminUsers;
