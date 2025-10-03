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
               outside of code, i'm usually playing basketball, learning new songs on the guitar, or playing chess<button
                onClick={toggleColorMode}
                className="mystery-button"
                aria-label="Toggle color mode"
              >
                ?
              </button>
              </p>
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