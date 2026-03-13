import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Copy, Check, Ticket } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface VoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherCode: string;
  protocolNumber: string;
  rewardName: string;
  pointsSpent: number;
}

const VoucherModal = ({ open, onOpenChange, voucherCode, protocolNumber, rewardName, pointsSpent }: VoucherModalProps) => {
  const [copied, setCopied] = useState(false);

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

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG value={voucherCode} size={120} level="M" />
            </div>
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
