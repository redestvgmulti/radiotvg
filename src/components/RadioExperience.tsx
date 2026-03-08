'use client';

import React from 'react';
import { Background } from '@/components/Background';
import { Navigation } from '@/components/Navigation';
import { GlobalPlayer } from '@/components/GlobalPlayer';
import { HeroLive } from '@/components/HeroLive';
import { AppExplore } from '@/components/AppExplore';
import { OnAirHighlight } from '@/components/OnAirHighlight';
import { ProgramSchedule } from '@/components/ProgramSchedule';
import { FeaturedVideos } from '@/components/FeaturedVideos';
import { SponsorsCarousel } from '@/components/SponsorsCarousel';
import '@/style/RadioExperience.css';

const RadioExperience = () => {
  return (
    <div className="radio-experience-container">
      <Background />

      <div className="radio-experience-layout">
        <Navigation />

        <main className="radio-experience-main">
          <div className="home-content-container">
            <HeroLive />
            <AppExplore />
            <OnAirHighlight />
            <ProgramSchedule />
            <FeaturedVideos />

            {/* Instagram Feed Section */}
            <section className="instagram-section">
              <div className="section-header">
                <h2 className="section-title">No Instagram @radiotvg</h2>
              </div>
              <div className="instagram-grid-placeholder">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="instagram-card-placeholder" />
                ))}
              </div>
            </section>

            <SponsorsCarousel />
          </div>
        </main>
      </div>

      <GlobalPlayer />
    </div>
  );
};

export default RadioExperience;
