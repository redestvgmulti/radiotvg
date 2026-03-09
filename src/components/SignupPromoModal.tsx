import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Gift, Trophy, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRadioStore } from '@/stores/useRadioStore';
import { useAuth } from '@/hooks/useAuth';

const THRESHOLD_SECONDS = 180;
const STORAGE_KEY = 'promo_modal_seen';

const SignupPromoModal = () => {
  const { user } = useAuth();
  const { isPlaying } = useRadioStore();
  const [show, setShow] = useState(false);
  const elapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggeredRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Skip if logged in or already shown this session
    if (user || triggeredRef.current || localStorage.getItem(STORAGE_KEY) === 'true') {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;
        if (elapsedRef.current >= THRESHOLD_SECONDS && !triggeredRef.current) {
          triggeredRef.current = true;
          setShow(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 1000);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }

    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [isPlaying, user]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const goSignup = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    navigate('/signup');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Header gradient */}
            <div className="relative h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center">
                <Headphones className="h-7 w-7 text-primary" />
              </div>
              <button onClick={dismiss} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pt-5 pb-6">
              <h2 className="text-base font-display font-bold text-foreground text-center leading-snug">
                🎧 Você já está ouvindo há alguns minutos!
              </h2>
              <p className="text-sm text-muted-foreground text-center mt-2 mb-5">
                Cadastre-se para aproveitar tudo:
              </p>

              <div className="space-y-2.5 mb-6">
                {[
                  { icon: Star, text: 'Ganhar pontos ouvindo a rádio' },
                  { icon: Trophy, text: 'Participar das promoções' },
                  { icon: Gift, text: 'Trocar pontos por prêmios' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <motion.button whileTap={{ scale: 0.98 }} onClick={goSignup}
                  className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center">
                  Criar Conta
                </motion.button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={dismiss}
                  className="w-full h-10 rounded-2xl text-muted-foreground font-medium text-sm">
                  Continuar ouvindo
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupPromoModal;
