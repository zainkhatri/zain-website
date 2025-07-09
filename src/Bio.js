import React, { useState, memo } from 'react';
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
              Hi, I’m Zain! I recently graduated from UC San Diego with a degree in Cognitive Science & Machine Learning. Right now, I’m a Software Engineering Intern at NASA, where I’m building tools that turn diagrams into simulations to test how they might fail. I’ve also worked on projects like autonomous rovers, exoskeleton control, and real time data systems.
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

export default memo(Bio);