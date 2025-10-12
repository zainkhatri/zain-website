// Hero.js
import React, { useState, useCallback, useEffect, memo } from 'react';
import Typewriter from 'typewriter-effect';
import { motion, AnimatePresence } from 'framer-motion';
import zainImage from './images/zkhatri.png';
import egomaniacImage from './images/egomaniac.jpeg';
import ElectricBorder from './ElectricBorder';
import './hero.css';

const Hero = memo(function Hero() {
  const [clickCount, setClickCount] = useState(0);
  const [typewriterText, setTypewriterText] = useState('zain khatri');
  const [isSpinning, setIsSpinning] = useState(false);
  const [isEgomaniacMode, setIsEgomaniacMode] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const handleImageClick = useCallback(() => {
    setClickCount(prev => {
      const newClickCount = prev + 1;

      // Show password prompt after 3 clicks
      if (newClickCount % 6 === 3) {
        setShowPasswordPrompt(true);
        setPasswordInput('');
        setPasswordError(false);
      } else if (newClickCount % 6 === 0) {
        // Exit ego mode
        setIsTransforming(true);
        setTimeout(() => {
          setIsSpinning(false);
          setTypewriterText('zain khatri');
          setIsEgomaniacMode(false);
        }, 400);
        setTimeout(() => {
          setIsTransforming(false);
        }, 800);
      }

      return newClickCount;
    });
  }, []);

  const checkPassword = useCallback(() => {
    const correctPassword = 'egomaniac';

    if (passwordInput.toLowerCase() === correctPassword) {
      setShowPasswordPrompt(false);
      setPasswordError(false);
      setShowTransition(true);

      setTimeout(() => {
        setIsTransforming(true);
        setIsSpinning(true);
        setTypewriterText('egomaniac');
        setIsEgomaniacMode(true);
      }, 200);

      setTimeout(() => {
        setIsTransforming(false);
        setShowTransition(false);
      }, 600);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  }, [passwordInput]);

  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();
    checkPassword();
  }, [checkPassword]);

  const handlePasswordCancel = useCallback(() => {
    setShowPasswordPrompt(false);
    setPasswordInput('');
    setPasswordError(false);
    setClickCount(prev => prev - 3); // Reset click count back
  }, []);

  const handlePasswordInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setPasswordInput(newValue);
    
    // Auto-check password when 9 characters are typed
    if (newValue.length === 9) {
      setTimeout(() => {
        const correctPassword = 'egomaniac';
        if (newValue.toLowerCase() === correctPassword) {
          setShowPasswordPrompt(false);
          setPasswordError(false);
          setShowTransition(true);

          setTimeout(() => {
            setIsTransforming(true);
            setIsSpinning(true);
            setTypewriterText('egomaniac');
            setIsEgomaniacMode(true);
          }, 200);

          setTimeout(() => {
            setIsTransforming(false);
            setShowTransition(false);
          }, 600);
        } else {
          setPasswordError(true);
          setTimeout(() => setPasswordError(false), 2000);
        }
      }, 100); // Small delay to ensure state is updated
    }
  }, []);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add useEffect to monitor ego mode and change background
  useEffect(() => {
    if (isEgomaniacMode) {
      document.body.classList.add('ego-mode');
    } else {
      document.body.classList.remove('ego-mode');
    }
  }, [isEgomaniacMode]);

  // Auto-focus password input when prompt appears
  useEffect(() => {
    if (showPasswordPrompt) {
      setTimeout(() => {
        const input = document.querySelector('.password-input-hidden');
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }, [showPasswordPrompt]);

  return (
    <header className="hero-section">
      <AnimatePresence>
        {showTransition && (
          <motion.div
            className="ego-transition-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.2, 0, 0.2, 1]
            }}
          />
        )}
      </AnimatePresence>
      {showPasswordPrompt && (
        <div className="password-overlay">
          <motion.div
            className="password-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Enter Password</h3>
            <p className="password-hint">Hint: What's Zain's nickname?</p>
            <form onSubmit={handlePasswordSubmit}>
              <div
                className={`password-display ${passwordError ? 'error' : ''}`}
                onClick={() => document.querySelector('.password-input-hidden').focus()}
              >
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} className="password-char">
                    {passwordInput[index] || '_'}
                    {index === passwordInput.length && <span className="cursor-blink">|</span>}
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={passwordInput}
                onChange={handlePasswordInputChange}
                maxLength="9"
                className="password-input-hidden"
                autoFocus
              />
              {passwordError && <p className="error-message">Incorrect password!</p>}
              <div className="password-buttons">
                <button type="button" onClick={handlePasswordCancel} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
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
              delay: 75,
              deleteSpeed: 50,
              autoStart: true,
              wrapperClassName: 'typewriter-wrapper',
              cursorClassName: 'typewriter-cursor',
            }}
            onInit={(typewriter) => {
              typewriter
                .typeString(typewriterText)
                .pauseFor(2500)
                .callFunction(() => {
                  typewriter.stop();
                })
                .start();
            }}
          />
          </h1>
          <h2>{isEgomaniacMode ? "vprezzy, mcfoot, humblemaniac, etc" : "machine learning & software engineer"}</h2>
          <div className={`description-line ${isEgomaniacMode ? 'regular-font' : ''}`}>
            <p>{isEgomaniacMode ? (
              <>
                i built <span style={{color: '#0066cc'}}>nasa</span>, <span style={{color: '#ffd700'}}>uc berkeley</span>, and <span style={{color: '#000000'}}>mohsin</span>.
              </>
            ) : "i've built for nasa, uc berkeley, and more."}</p>
          </div>
          <div className="greeting-line">
            <p>{isEgomaniacMode ? "" : "peace be upon you."}</p>
          </div>
        </div>
        <div className="image-and-contact">
          <AnimatePresence mode="wait">
            <motion.div
              key={isEgomaniacMode ? 'egomaniac' : 'zain'}
              className="hero-image-wrapper"
              initial={{
                opacity: 0,
                scale: 0.5,
                filter: "blur(20px) brightness(3)"
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px) brightness(1)"
              }}
              exit={{
                opacity: 0,
                scale: 1.3,
                filter: "blur(15px) brightness(0.3)"
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              {isEgomaniacMode ? (
                isMobile ? (
                  <img
                    src={egomaniacImage}
                    alt="egomaniac"
                    className="hero-image egomaniac-mode"
                    onClick={handleImageClick}
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <ElectricBorder
                    color="#ffffff"
                    speed={1}
                    chaos={0.1}
                    thickness={6}
                    style={{ borderRadius: '50%' }}
                  >
                    <img
                      src={egomaniacImage}
                      alt="egomaniac"
                      className="hero-image egomaniac-mode"
                      onClick={handleImageClick}
                      loading="eager"
                      decoding="async"
                    />
                  </ElectricBorder>
                )
              ) : (
                <img
                  src={zainImage}
                  alt="zain khatri"
                  className="hero-image"
                  onClick={handleImageClick}
                  loading="eager"
                  decoding="async"
                />
              )}
            </motion.div>
          </AnimatePresence>
          <motion.div
            className="contact-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {isEgomaniacMode ? (
              <>
                <motion.a
                  href="https://www.instagram.com/zainkhatrii/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.2, ease: [0.68, -0.55, 0.265, 1.55] }}
                  whileHover={{
                    scale: 1.2,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.8 }}
                >
                  <i className="fab fa-instagram"></i>
                </motion.a>
                <motion.a
                  href="https://open.spotify.com/user/khansarehere?si=4cf0f73fb48f44ab"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Spotify"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4, ease: [0.68, -0.55, 0.265, 1.55] }}
                  whileHover={{
                    scale: 1.2,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.8 }}
                >
                  <i className="fab fa-spotify"></i>
                </motion.a>
              </>
            ) : (
              <>
                <motion.a
                  href="mailto:zainnkhatri@gmail.com"
                  aria-label="Email"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.2, ease: [0.68, -0.55, 0.265, 1.55] }}
                  whileHover={{
                    scale: 1.2,
                    transition: { duration: 0.3 }
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
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4, ease: [0.68, -0.55, 0.265, 1.55] }}
                  whileHover={{
                    scale: 1.2,
                    transition: { duration: 0.3 }
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
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.6, ease: [0.68, -0.55, 0.265, 1.55] }}
                  whileHover={{
                    scale: 1.2,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.8 }}
                >
                  <i className="fab fa-github"></i>
                </motion.a>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
});

export default Hero;
