import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import logoRadio from '@/assets/logo-radio-tvg-new.png';

const DISMISS_KEY = 'pwa_install_dismissed';

const InstallAppPrompt = () => {
  const [show, setShow] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    await deferredPromptRef.current.userChoice;
    deferredPromptRef.current = null;
    setShow(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 text-center relative"
          >
            <button onClick={handleDismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>

            <img src={logoRadio} alt="Rádio TVG" className="h-12 mx-auto mb-4" />
            <h2 className="text-lg font-display font-bold text-foreground mb-1">Instalar aplicativo</h2>
            <p className="text-sm text-muted-foreground mb-6">Acesse a Rádio TVG direto da sua tela inicial</p>

            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
              >
                <Download className="h-4 w-4" /> Instalar
              </motion.button>
              <button onClick={handleDismiss} className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Agora não
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallAppPrompt;
