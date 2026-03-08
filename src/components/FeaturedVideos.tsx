import React from 'react';
import { Play } from 'lucide-react';
import '@/style/FeaturedVideos.css';

const videos = [
    {
        id: 1,
        title: 'Entrevista Exclusiva: O Futuro da Música',
        duration: '15:20',
        live: true,
        thumbnail: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d0?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: 2,
        title: 'Bastidores TVG: Nova Programação',
        duration: '08:45',
        live: false,
        thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: 3,
        title: 'Giro de Notícias Regional',
        duration: '12:10',
        live: true,
        thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&auto=format&fit=crop&q=60'
    }
];

export const FeaturedVideos = () => {
    return (
        <section className="featured-videos">
            <div className="section-header">
                <Play className="section-icon" size={24} />
                <h2 className="section-title">Vídeos em Destaque</h2>
            </div>

            <div className="videos-carousel">
                {videos.map((video) => (
                    <div key={video.id} className="video-card">
                        <div className="video-thumbnail-container">
                            <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                            <div className="video-badges">
                                {video.live && <span className="badge-live">AO VIVO</span>}
                                <span className="badge-duration">{video.duration}</span>
                            </div>
                            <div className="video-play-overlay">
                                <div className="play-circle">
                                    <Play size={24} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        <div className="video-info">
                            <h3 className="video-title">{video.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedVideos;
