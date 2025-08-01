// Hero.js
import React, { useState, useCallback, useEffect, memo } from 'react';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import zainImage from './zain.jpeg';
import './hero.css';

function Hero() {
  const [clickCount, setClickCount] = useState(0);
  const [typewriterText, setTypewriterText] = useState('zain khatri');
  const [isSpinning, setIsSpinning] = useState(false);

  const handleImageClick = useCallback(() => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Trigger spin effect and change text after 5 clicks
    if (newClickCount % 10 === 5) {
      setIsSpinning(true); // Start spinning
      setTypewriterText('egomaniac');
    } else if (newClickCount % 10 === 0) {
      setIsSpinning(false); // Stop spinning after a complete spin
      setTypewriterText('zain khatri');
    }
  }, [clickCount]);

  // Add useEffect to monitor clickCount and change background
  useEffect(() => {
    const isEgoPhase = clickCount % 10 >= 5 && clickCount % 10 < 10;
    if (isEgoPhase) {
      document.body.classList.add('ego-mode');
    } else {
      document.body.classList.remove('ego-mode');
    }
  }, [clickCount]);

  return (
    <header className="hero-section">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-content">
          <h1 className="typewriter-text">
          <Typewriter
            key={typewriterText}
            options={{
              loop: false, 
              cursor: '|',
              delay: 100, // Reduced from 150ms to 100ms for faster typing
            }}
            onInit={(typewriter) => {
              typewriter
                .typeString(typewriterText)
                .pauseFor(2500) // Pause for a bit after typing
                .callFunction(() => {
                  typewriter.stop();
                })
                .start();
            }}
          />
          </h1>
          <h2>machine learning & software engineer</h2>
          <div className="description-line">
            <p>i've built for nasa, uc berkeley, and more.</p>
          </div>
          <div className="greeting-line">
            <p>peace be upon you.</p>
          </div>
        </div>
        <div className="image-and-contact">
          <motion.img
            src={zainImage}
            alt="zain khatri"
            className="hero-image"
            onClick={handleImageClick}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotate: isSpinning ? 360 : 0
            }}
            transition={{ 
              duration: 1, 
              ease: [0.25, 0.46, 0.45, 0.94],
              rotate: { duration: 1, ease: 'easeInOut' }
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          />
          <motion.div 
            className="contact-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.a 
              href="mailto:zainnkhatri@gmail.com" 
              aria-label="Email"
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: [0.68, -0.55, 0.265, 1.55] }}
              whileHover={{ 
                scale: 1.2, 
                rotate: 360,
                transition: { duration: 0.4 }
              }}
              whileTap={{ scale: 0.8 }}
            >
              <i className="fas fa-envelope"></i>
            </motion.a>
            <motion.a 
              href="https://www.linkedin.com/in/zainkhatri2560" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="LinkedIn"
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.68, -0.55, 0.265, 1.55] }}
              whileHover={{ 
                scale: 1.2, 
                rotate: 360,
                transition: { duration: 0.4 }
              }}
              whileTap={{ scale: 0.8 }}
            >
              <i className="fab fa-linkedin"></i>
            </motion.a>
            <motion.a 
              href="https://github.com/zainkhatri" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub"
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 1.6, ease: [0.68, -0.55, 0.265, 1.55] }}
              whileHover={{ 
                scale: 1.2, 
                rotate: 360,
                transition: { duration: 0.4 }
              }}
              whileTap={{ scale: 0.8 }}
            >
              <i className="fab fa-github"></i>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}

export default memo(Hero);
