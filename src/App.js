import React, { useState } from 'react';
import './global.css';
import './hero.css';
import './expandable-content.css';
import './projects.css';
import './gallery.css';
import './responsive.css';
import Hero from './Hero';
import Bio from './Bio';
import Projects from './Projects';
import Gallery from './Gallery';
import resumePDF from './Zain Khatri Resume 2024.pdf';

function App() {
  return (
    <div className="App">
      <Hero />
      <Bio />
      <Projects />
      <Gallery />
      <section id="resume" className="content-section resume">
        <h2 onClick={() => window.open(resumePDF, '_blank')} className="expandable-title">
          Resume +
        </h2>
      </section>
    </div>
  );
}

export default App;
