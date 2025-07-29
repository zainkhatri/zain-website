import React, { useState, useEffect, Suspense, lazy } from 'react';
import './app.css';
import Hero from './Hero';
import Bio from './Bio';
import { Analytics } from "@vercel/analytics/react";
import { motion } from 'framer-motion';

// Lazy load heavy components
const Projects = lazy(() => import('./Projects'));
const Gallery = lazy(() => import('./Gallery'));
const Albums = lazy(() => import('./Albums'));

function App() {
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    if (isContentExpanded) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [isContentExpanded]);

  // Start navigation animation after typewriter finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavigation(true);
    }, 2000); // Increased to 2 seconds to start right when typewriter finishes

    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth motion
      }
    }
  };

  return (
    <div className="App">
      <Hero />
      
      {showNavigation && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="navigation-sections"
        >
          <motion.div variants={itemVariants}>
            <Bio onToggle={handleToggle} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
              <Projects />
            </Suspense>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <section id="resume" className="content-section resume">
              <h2 onClick={() => window.open('/Zain_Khatri_Resume.pdf', '_blank')} className="expandable-title">
                resume +
              </h2>
            </section>
          </motion.div>
        
          <motion.div variants={itemVariants}>
            <Suspense fallback={<div className="loading-spinner">Loading Gallery...</div>}>
              <Gallery />
            </Suspense>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Suspense fallback={<div className="loading-spinner">Loading Albums...</div>}>
              <Albums onToggle={handleToggle} />
            </Suspense>
          </motion.div>
        </motion.div>
      )}

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
