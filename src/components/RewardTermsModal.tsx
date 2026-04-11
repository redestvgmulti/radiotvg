import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RewardTermsModalProps {
  open: boolean;
  onAccept: () => void;
  termsVersion: string;
}

const RewardTermsModal = ({ open, onAccept, termsVersion }: RewardTermsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    if (!user) return;
    
    setLoading(true);
    
    const { error } = await supabase
      .from('reward_terms_acceptances')
      .insert({
        user_id: user.id,
        terms_version: termsVersion
      });
      
    setLoading(false);
    
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar seu aceite agora. Tente novamente.',
        variant: 'destructive'
      });
      return;
    }
    
    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Prevent closing without accepting
      if (!val) return;
    }}>
      <DialogContent 
        className="max-w-md mx-auto rounded-3xl border-primary/20 bg-card p-0 overflow-hidden [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/10 px-6 pt-6 pb-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-foreground">
              Termos de Troca de Recompensas
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/80 mt-2 font-medium">
              Antes de continuar, você precisa aceitar as regras do programa de recompensas.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content section */}
        <div className="px-6 py-5 space-y-6">
          <div className="text-xs text-muted-foreground space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50 max-h-[30vh] overflow-y-auto">
            <ul className="list-disc pl-4 space-y-2">
              <li>Os pontos acumulados podem ser usados para resgatar recompensas disponíveis.</li>
              <li>Os pontos são cumulativos.</li>
              <li>Cada recompensa pode ser resgatada apenas 1 vez por semana por usuário.</li>
              <li>Se uma recompensa já tiver sido resgatada nesta semana, ela ficará indisponível até a próxima semana.</li>
              <li>Outras recompensas diferentes continuam disponíveis, desde que o usuário tenha pontos suficientes.</li>
              <li>Ao confirmar um resgate, os pontos correspondentes serão debitados automaticamente.</li>
              <li>As recompensas estão sujeitas à disponibilidade.</li>
              <li>Resgates confirmados podem não ser cancelados.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <div className="w-5 h-5 border-2 border-primary/50 rounded flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-all">
                  <motion.svg
                    initial={false}
                    animate={{ opacity: accepted ? 1 : 0, scale: accepted ? 1 : 0.5 }}
                    className="w-3.5 h-3.5 text-primary-foreground pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                </div>
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors select-none">
                Li e aceito os termos de troca de recompensas
              </span>
            </label>

            <motion.button
              whileTap={accepted ? { scale: 0.97 } : {}}
              disabled={!accepted || loading}
              onClick={handleAccept}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Aceitar e continuar'}
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardTermsModal;
