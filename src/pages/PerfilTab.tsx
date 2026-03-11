import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Clock, Gift, ChevronRight, LogIn, LogOut, Loader2, Star, Instagram, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import heroPerfil from '@/assets/hero-perfil.jpg';

interface Profile {
  display_name: string;
  avatar_url: string;
  total_points: number;
  total_listening_minutes: number;
}

interface Redemption {
  id: string;
  points_spent: number;
  redeemed_at: string;
  reward_id: string;
}

const INSTAGRAM_HANDLE = 'radiotvg';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const PerfilTab = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { setProfile(null); setRedemptions([]); setRank(null); return; }
    const load = async () => {
      setLoadingProfile(true);
      const [profileRes, redemptionsRes, rankRes] = await Promise.all([
        supabase.from('profiles').select('display_name, avatar_url, total_points, total_listening_minutes').eq('user_id', user.id).single(),
        supabase.from('redemptions').select('*').eq('user_id', user.id).order('redeemed_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('user_id').order('total_points', { ascending: false }),
      ]);
      setProfile(profileRes.data as Profile | null);
      setRedemptions((redemptionsRes.data as Redemption[]) || []);
      if (rankRes.data) {
        const idx = rankRes.data.findIndex((p: any) => p.user_id === user.id);
        setRank(idx >= 0 ? idx + 1 : null);
      }
      setLoadingProfile(false);
    };
    load();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: 'Formato inválido', description: 'Use JPG, PNG ou WebP.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 2MB.', variant: 'destructive' });
      return;
    }

    setUploadingAvatar(true);
    const path = `${user.id}/avatar.webp`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast({ title: 'Erro no upload', description: uploadError.message, variant: 'destructive' });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('user_id', user.id);
    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    toast({ title: 'Foto atualizada!' });
    setUploadingAvatar(false);
  };

  const formatMinutes = (m: number) => {
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    const mins = m % 60;
    return mins > 0 ? `${h}h ${mins}min` : `${h}h`;
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  // Not logged in
  if (!user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-36">
        <header className="px-5 pt-4 pb-2">
          <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Perfil</h1>
        </header>
        <div className="relative mx-4 mb-6 rounded-3xl overflow-hidden h-[28vh]" style={{ minHeight: 180, maxHeight: 300 }}>
          <img src={heroPerfil} alt="Perfil" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="relative z-10 flex flex-col items-center justify-end h-full pb-6">
            <div className="w-18 h-18 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-3">
              <User className="h-8 w-8 text-white/60" />
            </div>
            <p className="text-white text-lg font-display font-bold">Ouvinte</p>
            <p className="text-white/40 text-xs mt-0.5">Crie uma conta para acumular pontos</p>
          </div>
        </div>
        <div className="px-4 space-y-2">
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
            <LogIn className="h-4 w-4" /> Entrar na conta
          </motion.button>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/signup')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-card border border-border text-foreground font-semibold text-sm">
            Criar conta
          </motion.button>
        </div>
        <InstagramSection />
      </motion.div>
    );
  }

  // Logged in
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-36">
      <header className="px-5 pt-4 pb-2">
        <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Perfil</h1>
      </header>

      {loadingProfile ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Profile Hero */}
          <div className="relative mx-4 mb-6 rounded-3xl overflow-hidden h-[28vh]" style={{ minHeight: 180, maxHeight: 300 }}>
            <img src={heroPerfil} alt="Perfil" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="relative z-10 flex flex-col items-center justify-end h-full pb-6">
              {/* Avatar with upload */}
              <div className="relative mb-3">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full border-[3px] border-white/30 object-cover" style={{ width: 80, height: 80 }} />
                ) : (
                  <div className="rounded-full bg-primary/20 backdrop-blur-xl border-[3px] border-primary/30 flex items-center justify-center" style={{ width: 80, height: 80 }}>
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg border-2 border-background disabled:opacity-60"
                >
                  {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <p className="text-white text-lg font-display font-bold">{profile?.display_name || user.email?.split('@')[0]}</p>
              {rank && (
                <div className="flex items-center gap-1 mt-1">
                  <Trophy className="h-3 w-3 text-amber-400" />
                  <span className="text-white/60 text-xs">#{rank} no ranking</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-4 grid grid-cols-3 gap-2 mb-5">
            <div className="rounded-2xl bg-card border border-border p-3 text-center">
              <Star className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{profile?.total_points || 0}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Pontos</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 text-center">
              <Clock className="h-4 w-4 text-accent mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{formatMinutes(profile?.total_listening_minutes || 0)}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Ouvindo</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 text-center">
              <Trophy className="h-4 w-4 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{rank ? `#${rank}` : '—'}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Ranking</p>
            </div>
          </div>

          {/* Points Info Card */}
          <div className="px-4 mb-5">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10">
              <Clock className="h-5 w-5 text-accent flex-shrink-0" />
              <p className="text-xs text-muted-foreground">A cada 60 minutos ouvindo a rádio você ganha <span className="text-foreground font-semibold">10 pontos</span>.</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-4 space-y-2 mb-5">
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/premios')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-white/[0.04] hover:bg-card/80 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Gift className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-foreground">Trocar Pontos</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            </motion.button>
          </div>

          {/* Redemption History */}
          {redemptions.length > 0 && (
            <div className="px-4 mb-5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">Últimas Trocas</p>
              <div className="space-y-2">
                {redemptions.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-card/50 border border-white/[0.04]">
                    <div>
                      <p className="text-sm text-foreground font-medium">-{r.points_spent} pontos</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(r.redeemed_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Gift className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <InstagramSection />

          {/* Logout */}
          <div className="px-4 mt-6 mb-4">
            <motion.button whileTap={{ scale: 0.98 }} onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm border border-destructive/20">
              <LogOut className="h-4 w-4" /> Sair da conta
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

const InstagramSection = () => (
  <section className="px-4 mt-6">
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1.5">
        <Instagram className="h-3.5 w-3.5" /> Instagram
      </h2>
      <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer"
        className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
        @{INSTAGRAM_HANDLE} <ChevronRight className="h-3 w-3" />
      </a>
    </div>
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 hover:bg-card/80 transition-colors">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Instagram className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">@{INSTAGRAM_HANDLE}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Siga-nos para novidades e bastidores</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
      </a>
    </div>
  </section>
);

export default PerfilTab;
