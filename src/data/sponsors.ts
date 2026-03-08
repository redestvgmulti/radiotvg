export interface Sponsor {
    id: string;
    name: string;
    mediaType: 'image' | 'video';
    url: string;
    duration?: number; // Duration in seconds for this slide
    priority?: number;
}

export const sponsors: Sponsor[] = [
    // Example data - Replace with real sponsors later
    // {
    //   id: '1',
    //   name: 'Example Sponsor',
    //   mediaType: 'image',
    //   url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1080&auto=format&fit=crop',
    //   duration: 10
    // }
];
