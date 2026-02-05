export type Stream = {
  id: string;
  name: string;
  description: string;
  accent: string;
  audioUrl: string;
  mood: string;
};

export const streams: Stream[] = [
  {
    id: 'sertanejo',
    name: 'Sertanejo',
    description: 'Vozes vibrantes, violas e calor de estrada.',
    accent: 'accent-gold',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    mood: 'Clima dourado e nostálgico.'
  },
  {
    id: 'rock',
    name: 'Rock',
    description: 'Guitarras cruas e pulsação elétrica.',
    accent: 'accent-rose',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    mood: 'Energia intensa e dramática.'
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Brilho futurista e hooks hipnóticos.',
    accent: 'accent-cyan',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    mood: 'Neon suave e moderno.'
  },
  {
    id: 'gospel',
    name: 'Gospel',
    description: 'Vozes elevadas e presença espiritual.',
    accent: 'accent-lime',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    mood: 'Luz serena e expansiva.'
  }
];

export const defaultStreamId = 'pop';
