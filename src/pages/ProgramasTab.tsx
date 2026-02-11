import { motion } from 'framer-motion';
import { LayoutGrid, Clock, Headphones } from 'lucide-react';

const mockPrograms = [
  { id: '1', name: 'Manhã Sertaneja', schedule: 'Seg-Sex 6h-10h', host: 'DJ Ricardo', listeners: '1.2K' },
  { id: '2', name: 'Tarde Pop', schedule: 'Seg-Sex 14h-18h', host: 'Ana Costa', listeners: '890' },
  { id: '3', name: 'Noite Raiz', schedule: 'Seg-Sáb 20h-00h', host: 'Seu Jorge', listeners: '1.5K' },
  { id: '4', name: 'Gospel ao Amanhecer', schedule: 'Todos os dias 5h-6h', host: 'Pastor Lucas', listeners: '2.1K' },
  { id: '5', name: 'Rock Classics', schedule: 'Sáb-Dom 12h-16h', host: 'Maria Rios', listeners: '760' },
];

const ProgramasTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 px-4 pt-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <LayoutGrid className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Programas</h1>
          <p className="text-xs text-muted-foreground">Grade de programação</p>
        </div>
      </div>

      <div className="space-y-3">
        {mockPrograms.map((program, i) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-subtle rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-card/60 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{program.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{program.schedule}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">com {program.host}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-primary">{program.listeners}</p>
              <p className="text-[10px] text-muted-foreground">ouvintes</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProgramasTab;
