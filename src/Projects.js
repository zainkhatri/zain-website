import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import roverImage from './rover.jpeg';
import eegImage from './eeg.jpeg';
import './projects.css';
import MLGame from './MLGame';
import RoverSimulation from './RoverSimulation';
import BrainActivityChart from './BrainActivityChart';

function Projects() {
  const [areProjectsVisible, setAreProjectsVisible] = useState(false);

  const toggleProjects = useCallback(() => {
    setAreProjectsVisible((prev) => !prev);
  }, []);

  return (
    <section id="projects" className="content-section projects">
      <h2 onClick={toggleProjects} className="expandable-title">
        Projects {areProjectsVisible ? '-' : '+'}
      </h2>
      {/* Remove AnimatePresence to prevent unnecessary unmounting */}
      {areProjectsVisible && (
        <motion.div
          className="content expanded"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'top' }}
        >
          {/* NASA Rover Project */}
          <div className="project">
            <div className="project-content">
              <h3 className="project-title">
                <a
                  href="https://github.com/zainkhatri/NASA-CASGC"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NASA Autonomous Rover
                </a>
              </h3>
              <p className="project-description">
                Designed and implemented an autonomous rover equipped with GPS and
                magnetometer for navigation, achieving 95% accuracy in reaching
                targeted locations. This system proved highly effective in outdoor
                environments, demonstrating the rover's ability to navigate with minimal
                error.
              </p>
              {/* Rover Simulation */}
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
                <a
                  href="https://github.com/zainkhatri/eagle-eye-game"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Eagle Eye Algorithm
                </a>
              </h3>
              {/* Memoize MLGame to prevent unnecessary re-renders */}
              <MLGame />
            </div>
          </div>

          {/* Exoskeleton Project */}
          <div className="project">
            <div className="project-content">
              <h3 className="project-title">
                <a
                  href="https://github.com/zainkhatri/exoskeleton-brainwave-algorithm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UC Berkeley Exoskeleton Brainwave Algorithm
                </a>
              </h3>
              <p className="project-description">
                Developed an algorithm that uses machine learning and signal processing
                techniques to improve mobility command differentiation by 25%. Integrated
                into an exoskeleton system, the algorithm allows for real-time
                classification of EEG data.
              </p>
              {/* Brain Activity Radar Chart */}
            </div>
            <motion.img
              src={eegImage}
              alt="Brainwave Measurement"
              className="project-image exoskeleton-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}

export default Projects;
