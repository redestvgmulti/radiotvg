import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logoRadio from '@/assets/logo-radio-tvg.png';

const AppHeader = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('radio_settings')
        .select('value')
        .eq('key', 'whatsapp_number')
        .maybeSingle();
      if (data?.value) setWhatsappNumber(data.value);
    };
    load();
  }, []);

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="h-9 flex items-center">
        <img src={logoRadio} alt="Rádio TVG" className="h-full w-auto object-contain" />
      </div>

      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-white/[0.06] text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5 text-accent" />
          <span className="hidden sm:inline">Participar no WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      )}
    </header>
  );
};

export default AppHeader;
