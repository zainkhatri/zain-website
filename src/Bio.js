import React, { useState, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import piperImage from './images/optimized/piper.webp';
import './bio.css';

function Bio() {
  const [isBioVisible, setIsBioVisible] = useState(false);
  const contentRef = useRef(null);

  const toggleBio = () => {
    setIsBioVisible(!isBioVisible);
  };

  return (
    <section id="bio" className="content-section bio">
      <h2 onClick={toggleBio} className="expandable-title">
        about me {isBioVisible ? '-' : '+'}
      </h2>
      <div className="content-wrapper">
        <AnimatePresence mode="wait">
          {isBioVisible && (
            <motion.div
              ref={contentRef}
              className="content expanded"
              initial={{ opacity: 0, maxHeight: 0 }}
              animate={{ opacity: 1, maxHeight: "1000px" }}
              exit={{ opacity: 0, maxHeight: 0 }}
              transition={{ 
                duration: 0.6,
                ease: "easeInOut"
              }}
            >
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
                </div>
                <div className="bio-image desktop-only">
                  <img 
                    src={piperImage} 
                    alt="Air" 
                    className="air-image"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default memo(Bio);