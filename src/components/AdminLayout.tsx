import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Force light theme
    document.documentElement.classList.remove('dark');

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin/login'); return; }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      setUserEmail(session.user.email || '');
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Admin · Rádio TVG</h1>
          <p className="text-[10px] text-muted-foreground">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="h-7 px-2.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <LogOut className="h-3 w-3" />
          Sair
        </button>
      </header>
      {children}
    </div>
  );
};

export default AdminLayout;
