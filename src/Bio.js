import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './bio.css';

function Bio() {
  const [isBioVisible, setIsBioVisible] = useState(false);

  const toggleBio = () => setIsBioVisible(!isBioVisible);

  return (
    <section id="bio" className="content-section bio">
      <h2 onClick={toggleBio} className="expandable-title">
        About Me {isBioVisible ? '-' : '+'}
      </h2>
      <AnimatePresence>
        {isBioVisible && (
          <motion.div
            className="content expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>
              Hello! I'm Zain, I'm a Senior at the University of California, San Diego, pursuing a degree in CS/COGSCI & ML. My passion lies in developing innovative solutions that blend technology and human cognition. 
            </p>
            <p>
              Aside from my technical work, I love to play basketball, learn new songs on the guitar, journal, ride my skateboard through the city, play chess, and meet new people when I have the pleasure.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Bio;