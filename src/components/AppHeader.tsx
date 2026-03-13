import logoRadio from '@/assets/logo-radio-tvg-new.jpg';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 h-20 flex items-center justify-center bg-background/80 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden">
      <div className="w-full flex items-center justify-center">
        <img src={logoRadio} alt="Rádio TVG Multi" className="w-full object-cover h-20" />
      </div>
    </header>
  );
};

export default AppHeader;
