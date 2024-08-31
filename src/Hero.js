import React, { useState } from 'react';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import zainImage from './zain.jpeg';
import './hero.css';

function Hero() {
  const [clickCount, setClickCount] = useState(0);
  const [typewriterText, setTypewriterText] = useState('Zain Khatri');
  const [isSpinning, setIsSpinning] = useState(false);

  const handleImageClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Trigger spin effect and change text after 5 clicks
    if (newClickCount % 10 === 5) {
      setIsSpinning(true); // Start spinning
      setTypewriterText('Egomaniac');
    } else if (newClickCount % 10 === 0) {
      setIsSpinning(false); // Stop spinning after a complete spin
      setTypewriterText('Zain Khatri');
    }
  };

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
                loop: true,
              }}
              onInit={(typewriter) => {
                typewriter
                  .typeString(typewriterText)
                  .pauseFor(2500)
                  .deleteAll()
                  .start();
              }}
            />
          </h1>
          <h2>Computer Science & Cognitive Science with specialization in Machine Learning</h2>
          <p>Creating innovative solutions that merge technology and human cognition. Peace be upon you.</p>
        </div>
        <div className="image-and-contact">
          <motion.img
            src={zainImage}
            alt="Zain Khatri"
            className="hero-image"
            onClick={handleImageClick}
            animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <div className="contact-section">
            <a href="mailto:zainkhatri2560@gmail.com" aria-label="Email">
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

export default Hero;
