import logoRadio from '@/assets/logo-radio-tvg.png';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 h-16 flex items-center px-4 bg-background/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="h-9 flex items-center">
        <img src={logoRadio} alt="Rádio TVG" className="h-full w-auto object-contain" />
      </div>
    </header>
  );
};

export default AppHeader;
