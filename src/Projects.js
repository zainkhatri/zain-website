import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import roverImage from './rover.jpeg';
import eegImage from './eeg.jpeg';
import nasaImage from './nasa3.jpeg';
import './projects.css';
import MLGame from './MLGame';
import RoverSimulation from './RoverSimulation';

function Projects() {
  const [areProjectsVisible, setAreProjectsVisible] = useState(false);

  const toggleProjects = () => setAreProjectsVisible(!areProjectsVisible);

  return (
    <section id="projects" className="content-section projects">
      <h2 onClick={toggleProjects} className="expandable-title">
        Projects {areProjectsVisible ? '-' : '+'}
      </h2>
      <AnimatePresence>
        {areProjectsVisible && (
          <motion.div
            className="content expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* NASA Rover Project */}
            <div className="project">
              <div className="project-content">
                <h3 className="project-title">
                  <a href="https://github.com/zainkhatri/NASA-CASGC" target="_blank" rel="noopener noreferrer">
                    NASA Autonomous Rover
                  </a>
                </h3>
                <p className="project-description">
                  Designed and implemented an autonomous rover equipped with GPS and magnetometer for navigation, achieving 95% accuracy in reaching targeted locations. This system proved highly effective in outdoor environments, demonstrating the rover's ability to navigate with minimal error.
                </p>
                
                {/* Rover Simulation with new class */}
                <div className="rover-simulation">
                  <RoverSimulation />
                </div>
              </div>
              <motion.img 
                src={roverImage} 
                alt="Autonomous Rover" 
                className="project-image nasa-rover-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>

            {/* ML Game Section */}
            <div className="project">
              <div className="project-content">
                <h3 className="project-title">
                  <a href="https://github.com/zainkhatri/eagle-eye-game" target="_blank" rel="noopener noreferrer">
                    Eagle Eye Algorithm
                  </a>
                </h3>
                <MLGame />
              </div>
            </div>

            {/* Exoskeleton Project */}
            <div className="project">
              <div className="project-content">
                <h3 className="project-title">
                  <a href="https://github.com/zainkhatri/exoskeleton-brainwave-algorithm" target="_blank" rel="noopener noreferrer">
                    UC Berkeley Exoskeleton Brainwave Algorithm 
                  </a>
                </h3>
                <p className="project-description">
                  Developed an algorithm that uses machine learning and signal processing techniques to improve mobility command differentiation by 25%. Integrated into an exoskeleton system, the algorithm allows for real-time classification of EEG data.
                </p>
              </div>
              <motion.img 
                src={eegImage} 
                alt="Brainwave Measurement" 
                className="project-image" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Projects;