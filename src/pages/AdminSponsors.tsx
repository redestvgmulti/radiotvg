import { motion } from 'framer-motion';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSponsors = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => navigate('/admin')} className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Patrocinadores</h1>
          <p className="text-[10px] text-muted-foreground">Gestão de sponsors</p>
        </div>
      </header>
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <Megaphone className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-xs text-muted-foreground">Seção em desenvolvimento.</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Gestão de patrocinadores será implementada aqui.</p>
      </div>
    </div>
  );
};

export default AdminSponsors;
