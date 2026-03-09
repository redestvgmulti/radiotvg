import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IN_APP_REGEX = /FBAN|FBAV|Instagram|WhatsApp/i;
const STORAGE_KEY = 'inapp_banner_dismissed';

/**
 * Detects in-app browsers (Instagram, Facebook, WhatsApp) on iOS
 * and shows a banner suggesting to open in Safari for background audio.
 */
const InAppBrowserBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isInApp = IN_APP_REGEX.test(navigator.userAgent);
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (isInApp && !dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const openInSafari = () => {
    // On iOS in-app browsers, window.open may open Safari
    window.open(window.location.href, '_blank');
    dismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 safe-top"
        >
          <div className="flex-1 min-w-0">
            <p className="text-amber-950 text-xs font-semibold leading-tight">
              Para melhor experiência, abra no Safari.
            </p>
            <p className="text-amber-900/70 text-[10px] mt-0.5">
              O áudio pode parar em navegadores internos.
            </p>
          </div>
          <button
            onClick={openInSafari}
            className="h-7 px-3 rounded-lg bg-amber-950/20 text-amber-950 text-[10px] font-bold flex items-center gap-1 whitespace-nowrap"
          >
            <ExternalLink className="h-3 w-3" /> Abrir
          </button>
          <button
            onClick={dismiss}
            className="h-6 w-6 rounded-full bg-amber-950/10 flex items-center justify-center text-amber-950/60"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InAppBrowserBanner;
