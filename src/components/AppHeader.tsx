import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import logoRadioFallback from '@/assets/logo-radio-tvg-new.jpg';

const AppHeader = () => {
  const [logoUrl, setLogoUrl] = useState(logoRadioFallback);

  useEffect(() => {
    supabase
      .from('radio_settings')
      .select('value')
      .eq('key', 'header_logo_url')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setLogoUrl(data.value);
      });
  }, []);

  return (
    <header className="sticky top-0 z-50 h-20 flex items-center justify-center bg-background/80 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden">
      <div className="w-full flex items-center justify-center">
        <img src={logoUrl} alt="Rádio TVG Multi" className="w-full object-cover h-20" />
      </div>
    </header>
  );
};

export default AppHeader;
