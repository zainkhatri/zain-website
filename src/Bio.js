import React, { useState } from 'react';
import './bio.css';
import './size-responsive.css';

function Bio() {
  const [isBioVisible, setIsBioVisible] = useState(false);

  const toggleBio = () => setIsBioVisible(!isBioVisible);

  return (
    <section id="bio" className="content-section bio">
      <h2 onClick={toggleBio} className="expandable-title">
        about me {isBioVisible ? '-' : '+'}
      </h2>
      <div className={`content ${isBioVisible ? 'expanded' : ''}`}>
        <p>
        hello! i'm zain khatri, a dedicated student at the university of california, san diego, pursuing a degree in computer science and cognitive science with a specialization in machine learning. my passion lies in developing innovative solutions that blend technology and human cognition.
        </p>
        <p>
        aside from my technical work, i love to play basketball, learn new songs on the guitar, journal, ride my skateboard through the city, and meet new people when i have the pleasure.
        </p>
      </div>
    </section>
  );
}

export default Bio;
