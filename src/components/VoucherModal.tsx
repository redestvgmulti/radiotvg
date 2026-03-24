import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Copy, Check, Ticket, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherCode: string;
  protocolNumber: string;
  rewardName: string;
  pointsSpent: number;
  expiresAt?: string;
}

const VoucherModal = ({ open, onOpenChange, voucherCode, protocolNumber, rewardName, pointsSpent, expiresAt }: VoucherModalProps) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!open || !expiresAt) return;
    
    const updateCountdown = () => {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      if (diffMs <= 0) {
        setIsExpired(true);
        setTimeLeft('Voucher expirado');
      } else {
        setIsExpired(false);
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) setTimeLeft(`Expira em ${days} dia${days > 1 ? 's' : ''} e ${hours}h`);
        else if (hours > 0) setTimeLeft(`Expira em ${hours}h e ${minutes}m`);
        else setTimeLeft(`Últimas horas: ${minutes}m`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // update every minute
    return () => clearInterval(interval);
  }, [open, expiresAt]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl border-primary/20 bg-card p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/10 px-6 pt-6 pb-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <Ticket className="h-7 w-7 text-primary" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold text-foreground">
              Voucher Gerado!
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mt-1">{rewardName}</p>
        </div>

        {/* Dashed separator */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
          <div className="border-t-2 border-dashed border-border mx-6" />
        </div>

        {/* Code section */}
        <div className="px-6 py-5 space-y-4">
          {/* Voucher Code */}
          <div className="text-center">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1.5">Código do Voucher</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <span className="text-xl font-mono font-bold text-primary tracking-widest">{voucherCode}</span>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-primary/60" />}
            </motion.button>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {copied ? 'Copiado!' : 'Toque para copiar'}
            </p>
          </div>

          {/* QR Code via API */}
          <div className="flex justify-center">
            <div className={`p-3 bg-white rounded-xl ${isExpired ? 'opacity-30 grayscale' : ''}`}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(voucherCode)}`}
                alt="QR Code"
                width={120}
                height={120}
              />
            </div>
          </div>

          {/* Countdown section */}
          {expiresAt && (
            <div className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 ${
              isExpired ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-orange-500/10 border-orange-500/20 text-orange-600'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{timeLeft}</span>
            </div>
          )}

          {/* Fixed location instruction */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-xs">Local de Retirada / Resgate</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Resgate o seu voucher na <strong>TVG Multi</strong> - Rua São Francisco, nº573, Apto 2 - Centro.
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Protocolo</span>
              <span className="font-mono font-semibold text-foreground">{protocolNumber}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pontos utilizados</span>
              <span className="font-semibold text-foreground">{pointsSpent}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherModal;
