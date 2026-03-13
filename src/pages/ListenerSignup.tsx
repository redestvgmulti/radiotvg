import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoRadio from '@/assets/logo-radio-tvg-new.png';

const ListenerSignup = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: displayName.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (authError) throw authError;
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message.includes('already registered')
          ? 'Este email já está cadastrado.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex items-center justify-center px-5 pb-36">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-display font-bold text-foreground mb-2">Verifique seu email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enviamos um link de confirmação para <span className="text-foreground font-medium">{email}</span>. Clique no link para ativar sua conta.
          </p>
          <button onClick={() => navigate('/login')} className="text-primary font-semibold text-sm">
            Ir para Login
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background px-5 pb-36">
      <header className="flex items-center gap-3 pt-4 pb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-display font-bold text-foreground">Criar Conta</h1>
      </header>

      <div className="max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
          <div className="h-14 overflow-hidden flex items-center">
            <img src={logoRadio} alt="Rádio TVG" className="h-[180%] w-auto object-contain" />
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Nome de exibição" required value={displayName} onChange={e => setDisplayName(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type={showPassword ? 'text' : 'password'} placeholder="Senha (mínimo 6 caracteres)" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive text-center">{error}</motion.p>}

          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Conta'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold">Entrar</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default ListenerSignup;
