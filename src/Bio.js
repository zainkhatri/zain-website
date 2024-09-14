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
                Hi, I'm Zain! I'm a Senior at the University of California, San Diego, pursuing a degree in CS/COGSCI & ML. I've been fortunate to work on diverse projects, like developing algorithms for exoskeletons, building autonomous rovers, and create real-time detection and data management. 
              </p>
              <p>
                Aside from technical work, I love to play basketball, learn new songs on the guitar, skateboard, play chess, and meet new people when I have the pleasure.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Bio;