import logoRadio from '@/assets/logo-radio-tvg-new.png';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 h-16 flex items-center justify-center px-4 bg-background/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="w-full flex items-center justify-center">
        <img src={logoRadio} alt="Rádio TVG Multi" className="w-full max-w-2xl h-14 object-contain" />
      </div>
    </header>
  );
};

export default AppHeader;
