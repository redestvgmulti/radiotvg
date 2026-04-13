import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Loader2, Trophy, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VoucherModal from '@/components/VoucherModal';
import RewardTermsModal from '@/components/RewardTermsModal';
import RewardDetailModal from '@/components/RewardDetailModal';
import { startOfWeek } from 'date-fns';

const CURRENT_REWARD_TERMS_VERSION = "v1";

interface Reward {
  id: string;
  name: string;
  image_url: string;
  points_cost: number;
  partner: string;
  descricao: string;
  instrucoes_resgate: string;
  observacoes: string;
}

interface RankEntry {
  display_name: string;
  total_points: number;
  user_id: string;
  avatar_url?: string;
}

const RewardsTab = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [redeemedRewardIds, setRedeemedRewardIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [voucherModal, setVoucherModal] = useState<{ open: boolean; code: string; protocol: string; rewardName: string; points: number; expiresAt?: string }>({ open: false, code: '', protocol: '', rewardName: '', points: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const [rewardsRes, rankingRes] = await Promise.all([
      supabase.from('rewards').select('*').eq('is_active', true).order('points_cost'),
      supabase.from('profiles').select('display_name, total_points, user_id, avatar_url').order('total_points', { ascending: false }).order('total_listening_minutes', { ascending: false }).order('created_at', { ascending: true }).limit(3),
    ]);
    setRewards((rewardsRes.data as Reward[]) || []);
    setRanking((rankingRes.data as RankEntry[]) || []);

    if (user) {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      
      const [profileRes, vouchersRes, termsRes] = await Promise.all([
        supabase.from('profiles').select('total_points').eq('user_id', user.id).single(),
        supabase.from('vouchers').select('reward_id').eq('user_id', user.id).gte('created_at', weekStart.toISOString()),
        supabase.from('reward_terms_acceptances').select('terms_version').eq('user_id', user.id).eq('terms_version', CURRENT_REWARD_TERMS_VERSION).maybeSingle()
      ]);
      setUserPoints(profileRes.data?.total_points || 0);
      
      if (vouchersRes.data) {
        setRedeemedRewardIds(new Set(vouchersRes.data.map(v => v.reward_id)));
      }
      
      if (!termsRes.data) {
        setTermsModalOpen(true);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRedeem = async (reward: Reward) => {
    if (!user) { navigate('/login'); return; }
    if (userPoints < reward.points_cost) { toast({ title: 'Pontos insuficientes', variant: 'destructive' }); return; }
    
    // O modal RewardDetailModal agora atua como confirmação.

    setRedeeming(reward.id);
    const { data, error } = await supabase.rpc('redeem_reward_voucher', {
      _reward_id: reward.id,
    });

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      setRedeeming(null);
      return;
    }

    type RedeemResult = { remaining_points: number; voucher_code: string; protocol_number: string };
    const result = data as RedeemResult;
    setUserPoints(result.remaining_points);
    setRedeemedRewardIds(prev => new Set([...Array.from(prev), reward.id]));
    setSelectedReward(null);
    setVoucherModal({
      open: true,
      code: result.voucher_code,
      protocol: result.protocol_number,
      rewardName: reward.name,
      points: reward.points_cost,
      expiresAt: result.expires_at,
    });
    setRedeeming(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-36">
      <header className="px-5 pt-4 pb-2">
        <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Prêmios</h1>
      </header>

      {/* Points Banner */}
      {user && (
        <div className="mx-4 mb-5 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/20 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{userPoints}</p>
            <p className="text-xs text-muted-foreground">pontos disponíveis</p>
          </div>
        </div>
      )}

      {/* Points Info Card */}
      <div className="mx-4 mb-5">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10">
          <Clock className="h-5 w-5 text-accent flex-shrink-0" />
          <p className="text-xs text-muted-foreground">A cada 60 minutos ouvindo a rádio você ganha <span className="text-foreground font-semibold">10 pontos</span>.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Rewards Grid */}
          <section className="px-4 mb-7">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">Recompensas</h2>
            {rewards.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border">
                <Gift className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Nenhuma recompensa disponível.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {rewards.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl bg-card border border-border overflow-hidden">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="w-full h-28 object-cover" />
                    ) : (
                      <div className="w-full h-28 bg-muted flex items-center justify-center"><Gift className="h-8 w-8 text-muted-foreground/20" /></div>
                    )}
                    <div className="p-4 flex flex-col flex-1 cursor-pointer" onClick={() => setSelectedReward(r)}>
                      <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                      {r.descricao && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {r.descricao}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto pt-3">
                        <span className="text-xs font-bold text-primary">{r.points_cost} pts</span>
                        {redeemedRewardIds.has(r.id) ? (
                          <span className="h-7 px-3 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-bold flex items-center justify-center text-center">
                            Resgatado esta semana
                          </span>
                        ) : (
                          <span className="h-7 px-3 rounded-lg bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center hover:bg-secondary/80 transition-colors">
                            Ver detalhes
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Ranking Podium */}
          <section className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">🏆 Top 3 Ouvintes</h2>
              <span className="text-[10px] text-muted-foreground">Melhores Pontuadores</span>
            </div>

            <div className="relative pt-12 pb-6 px-2 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl border border-white/[0.05] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              
              <div className="flex items-end justify-center gap-3 relative z-10">
                {/* 2nd Place */}
                {ranking[1] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center flex-1 max-w-[100px]"
                  >
                    <div className="relative mb-3">
                      <div className="w-16 h-16 rounded-full border-2 border-slate-300 bg-card overflow-hidden shadow-lg shadow-slate-300/10">
                        {ranking[1].avatar_url ? (
                          <img src={ranking[1].avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100"><User className="h-7 w-7 text-slate-400" /></div>
                        )}
                      </div>
                      <div className="absolute -top-2 -right-1 w-7 h-7 bg-slate-300 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-800 border-2 border-background shadow-sm">2º</div>
                    </div>
                    <p className="text-[10px] font-bold text-foreground truncate w-full text-center mb-0.5">{ranking[1].display_name || 'Ouvinte'}</p>
                    <p className="text-[9px] font-bold text-slate-400">{ranking[1].total_points} pts</p>
                  </motion.div>
                )}

                {/* 1st Place */}
                {ranking[0] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center flex-1 max-w-[120px] -mt-8"
                  >
                    <div className="relative mb-4">
                      <div className="absolute -inset-2 bg-amber-500/20 blur-xl rounded-full" />
                      <div className="w-20 h-20 rounded-full border-[3px] border-amber-500 bg-card overflow-hidden shadow-xl shadow-amber-500/20 relative z-10 animate-pulse-slow">
                        {ranking[0].avatar_url ? (
                          <img src={ranking[0].avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-50"><User className="h-9 w-9 text-amber-500" /></div>
                        )}
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-background shadow-lg z-20">1º</div>
                    </div>
                    <p className="text-xs font-bold text-foreground truncate w-full text-center mb-0.5">
                      {ranking[0].display_name || 'Ouvinte'}
                      {ranking[0].user_id === user?.id && <span className="text-[8px] text-primary block">(você)</span>}
                    </p>
                    <p className="text-xs font-black text-amber-500">{ranking[0].total_points} pts</p>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {ranking[2] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center flex-1 max-w-[90px]"
                  >
                    <div className="relative mb-3">
                      <div className="w-14 h-14 rounded-full border-2 border-orange-400/60 bg-card overflow-hidden shadow-lg shadow-orange-400/10">
                        {ranking[2].avatar_url ? (
                          <img src={ranking[2].avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-50"><User className="h-6 w-6 text-orange-400" /></div>
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400/80 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-background shadow-sm">3º</div>
                    </div>
                    <p className="text-[10px] font-bold text-foreground truncate w-full text-center mb-0.5">{ranking[2].display_name || 'Ouvinte'}</p>
                    <p className="text-[9px] font-bold text-orange-400/80">{ranking[2].total_points} pts</p>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
      <VoucherModal
        open={voucherModal.open}
        onOpenChange={(open) => setVoucherModal(prev => ({ ...prev, open }))}
        voucherCode={voucherModal.code}
        protocolNumber={voucherModal.protocol}
        rewardName={voucherModal.rewardName}
        pointsSpent={voucherModal.points}
        expiresAt={voucherModal.expiresAt}
      />
      <RewardTermsModal 
        open={termsModalOpen} 
        onAccept={() => setTermsModalOpen(false)} 
        termsVersion={CURRENT_REWARD_TERMS_VERSION} 
      />
      <RewardDetailModal 
        reward={selectedReward}
        open={!!selectedReward}
        onOpenChange={(open) => !open && setSelectedReward(null)}
        userPoints={userPoints}
        isRedeemedThisWeek={selectedReward ? redeemedRewardIds.has(selectedReward.id) : false}
        isRedeeming={redeeming === selectedReward?.id}
        onRedeem={handleRedeem}
        onRequiresTerms={() => setTermsModalOpen(true)}
        hasAcceptedTerms={!termsModalOpen}
      />
    </motion.div>
  );
};

export default RewardsTab;
