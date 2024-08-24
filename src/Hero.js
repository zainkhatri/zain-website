import React from 'react';
import Typewriter from 'typewriter-effect';
import zainImage from './zain.jpeg';
import './hero.css';

function Hero() {
  return (
    <header className="hero-section">
      <div className="hero-content">
        <div className="text-content">
          <h1 style={{ fontSize: '3.2em', lineHeight: '1.2', margin: '0', fontWeight: '700' }}>
            <Typewriter
              options={{
                loop: true,
              }}
              onInit={(typewriter) => {
                typewriter
                  .typeString('Zain Khatri')
                  .pauseFor(2500)
                  .deleteAll()
                  .start();
              }}
            />
          </h1>
          <h2>Computer Science & Cognitive Science with Specialization in Machine Learning</h2>
          <p>Creating innovative solutions that merge technology and human cognition. Peace be upon you.</p>
        </div>
        <img src={zainImage} alt="Zain Khatri" className="hero-image" />
      </div>
    </header>
  );
}

export default Hero;
