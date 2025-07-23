import React, { useState, useEffect, Suspense, lazy } from 'react';
import './app.css';
import Hero from './Hero';
import Bio from './Bio';
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
        <h2 onClick={() => window.open('/Zain_Khatri_Resume.pdf', '_blank')} className="expandable-title">
          resume +
        </h2>
      </section>
      
      <Suspense fallback={<div className="loading-spinner">Loading Gallery...</div>}>
        <Gallery />
      </Suspense>
      
      <Suspense fallback={<div className="loading-spinner">Loading Albums...</div>}>
        <Albums onToggle={handleToggle} />
      </Suspense>

      {/* Mobile social icons - positioned below music gallery */}
      <div className="mobile-social-icons">
        <a href="mailto:zainnkhatri@gmail.com" aria-label="Email">
          <i className="fas fa-envelope"></i>
        </a>
        <a href="https://www.linkedin.com/in/zainkhatri2560" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <i className="fab fa-linkedin"></i>
        </a>
        <a href="https://github.com/zainkhatri" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <i className="fab fa-github"></i>
        </a>
      </div>

      <footer className="footer">
        <p>©2024 Zain Khatri. All Rights Reserved.</p>
      </footer>

      <Analytics />
    </div>
  );
}

export default App;
