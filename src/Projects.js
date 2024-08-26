import React, { useState } from 'react';
import roverImage from './rover.jpeg';
import eegImage from './eeg.jpeg';
import nasaImage from './nasa3.jpeg';
import './projects.css';

function Projects() {
  const [areProjectsVisible, setAreProjectsVisible] = useState(false);

  const toggleProjects = () => setAreProjectsVisible(!areProjectsVisible);

  return (
    <section id="projects" className="content-section projects">
      <h2 onClick={toggleProjects} className="expandable-title">
        projects {areProjectsVisible ? '-' : '+'}
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
  );
}

export default Projects;
