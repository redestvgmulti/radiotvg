import logoRadio from '@/assets/logo-radio-tvg-new.jpg';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="w-full flex items-center justify-center">
        <img src={logoRadio} alt="Rádio TVG Multi" className="w-full object-contain" />
      </div>
    </header>
  );
};

export default AppHeader;
