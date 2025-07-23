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
  const [showGreeting, setShowGreeting] = useState(false);

  const handleImageClick = useCallback(() => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Trigger spin effect and change text after 5 clicks
    if (newClickCount % 10 === 5) {
      setIsSpinning(true); // Start spinning
      setTypewriterText('egomaniac');
      setShowGreeting(false);
    } else if (newClickCount % 10 === 0) {
      setIsSpinning(false); // Stop spinning after a complete spin
      setTypewriterText('zain khatri');
      setShowGreeting(false);
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
            }}
            onInit={(typewriter) => {
              typewriter
                .typeString(typewriterText)
                .callFunction(() => {
                  typewriter.stop();
                  // Start the greeting typewriter after the main one finishes
                  if (typewriterText === 'zain khatri') {
                    setShowGreeting(true);
                  }
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
            {showGreeting && (
              <Typewriter
                options={{
                  loop: false,
                  cursor: '',
                  delay: 30,
                }}
                onInit={(typewriter) => {
                  typewriter
                    .typeString('peace be upon you.')
                    .callFunction(() => {
                      typewriter.stop();
                    })
                    .start();
                }}
              />
            )}
          </div>
        </div>
        <div className="image-and-contact">
          <motion.img
            src={zainImage}
            alt="zain khatri"
            className="hero-image"
            onClick={handleImageClick}
            animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <div className="contact-section">
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
        </div>
      </motion.div>
    </header>
  );
}

export default memo(Hero);
