import React, { useState, useEffect } from 'react';
import './app.css';
import Hero from './Hero';
import Bio from './Bio';
import Projects from './Projects';
import Gallery from './Gallery';
import resumePDF from './zain.pdf';
import Albums from './Albums.js';
import { Analytics } from "@vercel/analytics/react"; // Import Analytics

function App() {
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  useEffect(() => {
    if (isContentExpanded) {
      document.body.style.overflow = 'auto'; // Enable scrolling
    } else {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    }
  }, [isContentExpanded]);

  const handleToggle = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  return (
    <div className="App">
      <Hero />
      <Bio onToggle={handleToggle} />
      <Projects />
      <section id="resume" className="content-section resume">
        <h2 onClick={() => window.open(resumePDF, '_blank')} className="expandable-title">
          Resume +
        </h2>
      </section>
      <Gallery />
      <Albums onToggle={handleToggle} />

      {/* Footer */}
      <footer className="footer">
        <p>©2024 Zain Khatri. All Rights Reserved.</p>
      </footer>

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}

export default App;
