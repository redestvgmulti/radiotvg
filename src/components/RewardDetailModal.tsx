import { motion } from 'framer-motion';
import { Gift, Loader2, X, Info, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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

interface RewardDetailModalProps {
  reward: Reward | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPoints: number;
  isRedeemedThisWeek: boolean;
  isRedeeming: boolean;
  onRedeem: (reward: Reward) => void;
  // added to ensure user has accepted terms before redeeming
  onRequiresTerms: () => void;
  hasAcceptedTerms: boolean;
}

const RewardDetailModal = ({
  reward,
  open,
  onOpenChange,
  userPoints,
  isRedeemedThisWeek,
  isRedeeming,
  onRedeem,
  onRequiresTerms,
  hasAcceptedTerms
}: RewardDetailModalProps) => {
  if (!reward) return null;

  const hasEnoughPoints = userPoints >= reward.points_cost;

  // Determine button state and styling
  let btnText = 'Resgatar agora';
  let btnDisabled = false;
  let btnClass = 'bg-primary text-primary-foreground hover:bg-primary/90';

  if (isRedeemedThisWeek) {
    btnText = 'Resgatado esta semana';
    btnDisabled = true;
    btnClass = 'bg-green-500/10 text-green-600 border border-green-500/20';
  } else if (!hasEnoughPoints) {
    btnText = 'Pontos insuficientes';
    btnDisabled = true;
    btnClass = 'bg-muted text-muted-foreground';
  }

  const handleAction = () => {
    if (btnDisabled || isRedeeming) return;
    if (!hasAcceptedTerms) {
      onOpenChange(false);
      onRequiresTerms();
      return;
    }
    onRedeem(reward);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0 rounded-3xl overflow-hidden border-border bg-card [&>button]:hidden">
        {/* Close Button Overlay */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-48 sm:h-56 bg-muted flex items-center justify-center overflow-hidden">
          {reward.image_url ? (
            <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover" />
          ) : (
            <Gift className="h-12 w-12 text-muted-foreground/30" />
          )}
          {/* Gradient Overlay for seamless text integration */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        {/* Content Container */}
        <div className="px-5 pb-6 pt-2 max-h-[60vh] overflow-y-auto space-y-5">
          {/* Title Area */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {reward.points_cost} pts
              </span>
              {reward.partner && (
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center">
                  Oferecido por {reward.partner}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold leading-tight text-foreground">{reward.name}</h2>
          </div>

          {/* Description */}
          {reward.descricao && (
            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {reward.descricao}
            </div>
          )}

          {/* Instructions */}
          {reward.instrucoes_resgate && (
            <div className="space-y-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Info className="h-4 w-4" />
                <span>Como usar</span>
              </div>
              <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {reward.instrucoes_resgate}
              </div>
            </div>
          )}

          {/* Observations (if any) */}
          {reward.observacoes && (
            <div className="space-y-2 p-4 rounded-2xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Observações</span>
              </div>
              <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {reward.observacoes}
              </div>
            </div>
          )}
          
          {/* Fixed expiration and location info */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-500/10 px-3 py-2.5 rounded-xl border border-orange-500/20">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Voucher gerado terá <strong>validade de 7 dias</strong> após o resgate.</span>
            </div>
            
            <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="leading-relaxed">
                <strong>Local de Retirada / Resgate fixo:</strong>
                <br />
                TVG Multi - Rua São Francisco, nº573, Apto 2 - Centro.
              </div>
            </div>
          </div>
          
          {/* Weekly reminder visually for user info */}
          <div className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mt-0.5 opacity-60 flex-shrink-0" />
            <span>Limite de 1 resgate por semana para esta recompensa.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-card border-t border-border">
          <motion.button
            whileTap={!btnDisabled && !isRedeeming ? { scale: 0.98 } : {}}
            onClick={handleAction}
            disabled={btnDisabled || isRedeeming}
            className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide transition-all ${btnClass}`}
          >
            {isRedeeming ? <Loader2 className="h-5 w-5 animate-spin" /> : btnText}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardDetailModal;
