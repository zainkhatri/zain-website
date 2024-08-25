import React, { useState } from 'react';
import './bio.css';
import './size-responsive.css';

function Bio() {
  const [isBioVisible, setIsBioVisible] = useState(false);

  const toggleBio = () => setIsBioVisible(!isBioVisible);

  return (
    <section id="bio" className="content-section bio">
      <h2 onClick={toggleBio} className="expandable-title">
        About Me {isBioVisible ? '-' : '+'}
      </h2>
      <div className={`content ${isBioVisible ? 'expanded' : ''}`}>
        <p>
          Hello! I'm Zain Khatri, a dedicated student at the University of California, San Diego, pursuing a degree in Computer Science and Cognitive Science with a specialization in Machine Learning. My passion lies in developing innovative solutions that blend technology and human cognition, with experience ranging from autonomous rovers to brainwave measurement algorithms.
        </p>
        <p>
          Aside from my technical work, I love to play basketball, learn new songs on the guitar, journal, ride my skateboard through the city, and meet new people when I have the pleasure.
        </p>
      </div>
    </section>
  );
}

export default Bio;
