import React, { useState } from 'react';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import zainImage from './zain.jpeg';
import './hero.css';

function Hero() {
  const [clickCount, setClickCount] = useState(0);
  const [typewriterText, setTypewriterText] = useState('Zain Khatri');

  const handleImageClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Reset the count after 3 clicks
    if (newClickCount % 6 === 3) {
      setTypewriterText('Egomaniac');
    } else if (newClickCount % 6 === 0) {
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
          <img
            src={zainImage}
            alt="Zain Khatri"
            className="hero-image"
            onClick={handleImageClick}
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
