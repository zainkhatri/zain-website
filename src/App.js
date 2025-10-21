import React, { useState, useEffect, Suspense, lazy } from 'react';
import './app.css';
import Hero from './Hero';
import Iridescence from './Iridescence';
import Bio from './Bio';
import { Analytics } from "@vercel/analytics/react";
import { motion } from 'framer-motion';

// Lazy load heavy components
const Projects = lazy(() => import('./Projects'));
const Gallery = lazy(() => import('./Gallery'));
const Albums = lazy(() => import('./Albums'));
const Movies = lazy(() => import('./Movies'));
const Egomaniac = lazy(() => import('./Egomaniac'));

const EGO_MODE_IRIDESCENCE_COLOR = [0.4, 0.3, 0.6];

function App() {
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isEgoMode, setIsEgoMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState([0.4, 0.4, 0.9]);

  useEffect(() => {
    if (isContentExpanded) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [isContentExpanded]);

  // Check if device is mobile with debouncing
  useEffect(() => {
    let timeoutId;
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 150);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Monitor ego mode from body class
  useEffect(() => {
    const checkEgoMode = () => {
      setIsEgoMode(document.body.classList.contains('ego-mode'));
    };

    // Check immediately
    checkEgoMode();

    // Create observer to watch for class changes
    const observer = new MutationObserver(checkEgoMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Listen for color mode changes from Bio component
  useEffect(() => {
    const handleColorChange = (event) => {
      setBackgroundColor(event.detail.color);
    };

    window.addEventListener('colorModeChange', handleColorChange);
    return () => window.removeEventListener('colorModeChange', handleColorChange);
  }, []);

  // Start navigation animation after typewriter finishes (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const timer = setTimeout(() => {
        setShowNavigation(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // On mobile, show navigation instantly
      setShowNavigation(true);
    }
  }, [isMobile]);

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
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
        <Iridescence
          color={isEgoMode ? EGO_MODE_IRIDESCENCE_COLOR : backgroundColor}
          mouseReact={!isMobile}
          amplitude={0.1}
          speed={isEgoMode ? 1 : (isMobile ? 0.5 : 0.7)}
          darkMode={isEgoMode}
        />
      </div>
      <Hero />
      
      {showNavigation && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="navigation-sections"
        >
          {isEgoMode ? (
            <motion.div variants={itemVariants}>
              <Suspense fallback={null}>
                <Egomaniac />
              </Suspense>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Bio onToggle={handleToggle} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Suspense fallback={null}>
                  <Projects />
                </Suspense>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Suspense fallback={null}>
                  <Gallery />
                </Suspense>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Suspense fallback={null}>
                  <Albums onToggle={handleToggle} />
                </Suspense>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Suspense fallback={null}>
                  <Movies />
                </Suspense>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      <footer className="footer">
        <p>©2025 Zain Khatri. All Rights Reserved.</p>
      </footer>

      <Analytics />
    </div>
  );
}

export default App;
