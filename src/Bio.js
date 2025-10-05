import React, { useState, memo, useRef, useEffect } from 'react';
import piperImage from './images/optimized/piper.webp';
import './bio.css';

function Bio() {
  const [isBioVisible, setIsBioVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [colorMode, setColorMode] = useState('normal'); // 'normal' or 'mystery'
  const contentRef = useRef(null);
  const wrapperRef = useRef(null);

  // Measure content height when visibility changes
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [isBioVisible]);

  // Add resize observer to update height on content changes
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContentHeight(entry.target.scrollHeight);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleBio = () => {
    setIsBioVisible(!isBioVisible);
  };

  const toggleColorMode = () => {
    const newMode = colorMode === 'normal' ? 'mystery' : 'normal';
    setColorMode(newMode);

    // Update the Iridescence background color via custom event
    const color = newMode === 'mystery' ? [1, 0, 0.5] : [0.4, 0.4, 0.9];
    window.dispatchEvent(new CustomEvent('colorModeChange', { detail: { color } }));
  };

  return (
    <section id="bio" className={`content-section bio ${isBioVisible ? 'expanded' : ''}`}>
      <h2 onClick={toggleBio} className="expandable-title">
        about me {isBioVisible ? '-' : '+'}
      </h2>
      <div 
        ref={wrapperRef}
        className="content-wrapper"
        style={{
          '--content-height': `${contentHeight}px`
        }}
      >
        <div ref={contentRef} className="content">
          <div className="bio-content">
            <div className="bio-text">
              <p>
                i'm zain! i just graduated from uc san diego with a focus in cognitive science & machine learning. right now, i'm at nasa building tools that turn system diagrams into live simulations. i'm helping engineers test how things might fail before they're even built.
              </p>
              <p>
                before that, i worked on real time brainwave classification at berkeley, and built things like autonomous rovers, agent based ai apps, and fast data systems.
              </p>
              <p>
               outside of code, i'm usually playing basketball, learning new songs on the guitar, or playing chess.
              </p>
              <button
                onClick={toggleColorMode}
                className="mystery-button"
                aria-label="Toggle day/night mode"
              >
                <svg className="sun-moon-icon" viewBox="0 0 24 24" width="20" height="20">
                  <mask id="moon-mask">
                    <rect x="0" y="0" width="24" height="24" fill="white" />
                    <circle className={`cutout ${colorMode === 'mystery' ? 'dark' : ''}`} cx="30" cy="10" r="3.5" fill="black" />
                  </mask>
                  <circle className="sun-circle" cx="12" cy="12" r="5" mask="url(#moon-mask)" fill="currentColor" />
                  <g className={`sun-rays ${colorMode === 'mystery' ? 'dark' : ''}`}>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>
              </button>
            </div>
            <div className="bio-image desktop-only">
              <img
                src={piperImage}
                alt="Air"
                className="air-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Bio);