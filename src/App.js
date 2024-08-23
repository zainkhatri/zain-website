import React, { useState } from 'react';
import './App.css';
import Typewriter from 'typewriter-effect';
import zainImage from './zain.jpeg';
import resumePDF from './Zain Khatri Resume 2024.pdf';
import roverImage from './rover.jpeg';
import eegImage from './eeg.jpeg';
import nasaImage from './nasa3.jpeg';

// Import images for the gallery
import img1 from './images/1.jpeg';
import img2 from './images/2.jpeg';
import img3 from './images/3.jpeg';
import img4 from './images/4.jpeg';
import img5 from './images/5.jpeg';
import img6 from './images/6.jpeg';
import img7 from './images/7.jpeg';
import img8 from './images/8.jpeg';


function App() {
  const [isBioVisible, setIsBioVisible] = useState(false);
  const [areProjectsVisible, setAreProjectsVisible] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);

  const toggleBio = () => setIsBioVisible(!isBioVisible);
  const toggleProjects = () => setAreProjectsVisible(!areProjectsVisible);
  const toggleGallery = () => setIsGalleryVisible(!isGalleryVisible);

  return (
    <div className="App">
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

      <section id="bio" className="content-section bio">
        <h2 onClick={toggleBio} className="expandable-title">
          About Me {isBioVisible ? '-' : '+'}
        </h2>
        <div className={`content ${isBioVisible ? 'expanded' : ''}`}>
          <p>
            Hello! I'm Zain Khatri, a dedicated student at the University of California, San Diego, pursuing a degree in Computer Science and Cognitive Science with a specialization in Machine Learning. My passion lies in developing innovative solutions that blend technology and human cognition, with experience ranging from autonomous rovers to brainwave measurement algorithms.
          </p>
          <p>
            Aside from my technical work, I love to play basketball, learn new songs on the guitar, journal, ride my skateboard through the city, and meeting new people when I have the pleasure.
          </p>
        </div>
      </section>

      <section id="projects" className="content-section projects">
        <h2 onClick={toggleProjects} className="expandable-title">
          Projects {areProjectsVisible ? '-' : '+'}
        </h2>
        <div className={`content ${areProjectsVisible ? 'expanded' : ''}`}>
          <div className="project">
            <img src={roverImage} alt="Autonomous Rover" className="project-image" />
            <div className="project-content">
              <h3 className="project-title">
                <a href="https://github.com/zainkhatri/NASA-CASGC" target="_blank" rel="noopener noreferrer">
                  NASA Autonomous Rover and Obstacle Avoidance
                </a>
              </h3>
              <p className="project-description">
                Designed and implemented an autonomous rover equipped with GPS and magnetometer for navigation, achieving 95% accuracy in reaching targeted locations. This system proved highly effective in outdoor environments, demonstrating the rover's ability to navigate with minimal error.
              </p>
            </div>
          </div>
          <div className="project">
            <img src={eegImage} alt="Brainwave Measurement" className="project-image" />
            <div className="project-content">
              <h3 className="project-title">
                <a href="https://github.com/zainkhatri/exoskeleton-brainwave-algorithm" target="_blank" rel="noopener noreferrer">
                  UC Berkeley Brainwave Measurement Algorithm for Exoskeleton Systems
                </a>
              </h3>
              <p className="project-description">
                Developed an algorithm that uses machine learning and signal processing techniques to improve mobility command differentiation by 25%. Integrated into an exoskeleton system, the algorithm allows for real-time classification of EEG data.
              </p>
            </div>
          </div>
          <div className="project">
            <img src={nasaImage} alt="File Decompressor" className="project-image" />
            <div className="project-content">
              <h3 className="project-title">
                <a href="https://github.com/zainkhatri/decompress" target="_blank" rel="noopener noreferrer">
                  Decompressing Huffman Code Algorithm
                </a>
              </h3>
              <p className="project-description">
                Developed a Java-based file decompressor that achieved 100% accuracy in restoring text data to its original state. Implemented robust error handling mechanisms, reducing user errors by 50%.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="content-section gallery">
        <h2 onClick={toggleGallery} className="expandable-title">
          Photo Gallery {isGalleryVisible ? '-' : '+'}
        </h2>
        <div className={`content ${isGalleryVisible ? 'expanded' : ''}`}>
          <div className="gallery-grid">
            {[img2, img4, img6, img1, img5, img8, img7, img3].map((img, index) => (
              <div key={index} className="gallery-item">
                <img src={img} alt={`Gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="resume" className="content-section resume">
        <h2 onClick={() => window.open(resumePDF, '_blank')} className="expandable-title">
          Resume +
        </h2>
      </section>
    </div>
  );
}

export default App;