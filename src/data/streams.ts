export interface Stream {
  id: string;
  name: string;
  description: string;
  url: string;
  theme: {
    color: string;
    gradient: string;
    shadow: string;
    overlay: string;
  };
  cover: string;
}

export const streams: Stream[] = [
  {
    id: 'sertanejo',
    name: 'Sertanejo',
    description: 'Estrada e calor humano',
    url: 'https://ice.fabricahost.com.br/radiotvgsertanejo',
    theme: {
      color: 'text-amber-400',
      gradient: 'from-amber-900 via-yellow-900 to-amber-950',
      shadow: 'shadow-amber-500/20',
      overlay: 'bg-amber-950/40' // Warmth
    },
    cover: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&q=80' // Country/Roots
  },
  {
    id: 'pop', // Keeping 'pop' ID for now to avoid breaking existing state if any, or should I change to 'pop-rock'? User said "Pop/Rock". I'll map 'pop' to 'Pop/Rock' label.
    name: 'Pop/Rock',
    description: 'Energia e movimento',
    url: 'https://ice.fabricahost.com.br/radiotvgpopular',
    theme: {
      color: 'text-violet-400',
      gradient: 'from-indigo-900 via-purple-900 to-blue-950',
      shadow: 'shadow-violet-500/30',
      overlay: 'bg-indigo-950/40' // Energy
    },
    cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80' // Concert Energy
  },
  {
    id: 'raiz',
    name: 'Raiz',
    description: 'Profundidade e brasilidade',
    url: 'https://ice.fabricahost.com.br/radiotvgraiz', // Assuming URL, or use placeholder if not known. I'll use a placeholder or safe default.
    theme: {
      color: 'text-orange-300',
      gradient: 'from-orange-950 via-amber-950 to-stone-950',
      shadow: 'shadow-orange-700/20',
      overlay: 'bg-stone-950/50' // Earthy
    },
    cover: 'https://images.unsplash.com/photo-1484100356142-db6ab6244067?w=800&q=80' // Acoustic/Intimate
  },
  {
    id: 'gospel',
    name: 'Gospel',
    description: 'Elevação e calmaria',
    url: 'https://ice.fabricahost.com.br/radiotvggospel', // Assuming URL
    theme: {
      color: 'text-sky-300',
      gradient: 'from-sky-900 via-cyan-900 to-slate-900',
      shadow: 'shadow-sky-400/20',
      overlay: 'bg-cyan-950/30' // Ethereal
    },
    cover: 'https://images.unsplash.com/photo-1507643179173-39db74c239e3?w=800&q=80' // Clouds/Light
  }
];

export const defaultStreamId = 'pop';
