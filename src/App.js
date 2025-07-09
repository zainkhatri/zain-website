import React, { useState, useEffect, Suspense, lazy } from 'react';
import './app.css';
import Hero from './Hero';
import Bio from './Bio';
import resumePDF from './zain_khatri_resume.pdf';
import { Analytics } from "@vercel/analytics/react";

// Lazy load heavy components
const Projects = lazy(() => import('./Projects'));
const Gallery = lazy(() => import('./Gallery'));
const Albums = lazy(() => import('./Albums'));

function App() {
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  useEffect(() => {
    if (isContentExpanded) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [isContentExpanded]);

  const handleToggle = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  return (
    <div className="App">
      <Hero />
      <Bio onToggle={handleToggle} />
      
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Projects />
      </Suspense>
      
      <section id="resume" className="content-section resume">
        <h2 onClick={() => window.open(resumePDF, '_blank')} className="expandable-title">
          Resume +
        </h2>
      </section>
      
      <Suspense fallback={<div className="loading-spinner">Loading Gallery...</div>}>
        <Gallery />
      </Suspense>
      
      <Suspense fallback={<div className="loading-spinner">Loading Albums...</div>}>
        <Albums onToggle={handleToggle} />
      </Suspense>

      <footer className="footer">
        <p>©2024 Zain Khatri. All Rights Reserved.</p>
      </footer>

      <Analytics />
    </div>
  );
}

export default App;
