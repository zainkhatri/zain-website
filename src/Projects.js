import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import roverImage from './rover.jpeg';
import eegImage from './eeg.jpeg';
import './projects.css';
import MLGame from './MLGame';
import RoverSimulation from './RoverSimulation';
import BrainActivityChart from './BrainActivityChart';
import MunchMate from './MunchMate';

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
      <AnimatePresence mode="wait">
        {areProjectsVisible && (
          <motion.div
            className="content expanded"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
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
                  This project involves building an autonomous rover for navigation using GPS and magnetometer data. The rover was developed using Arduino, 
                  programmed in C, with extensive work on wiring, soldering, and 3D printing custom parts. The rover autonomously follows waypoints while 
                  avoiding obstacles, demonstrating its capabilities in a real-time simulation.
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

         {/* MunchMate Project */}
            <div className="project">
              <div className="project-content">
                <h3 className="project-title">
                  <a
                    href="https://github.com/zainkhatri/munchmate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MunchMate - AI Recipe Generator
                  </a>
                </h3>
                <p className="project-description">
                  An AI-powered recipe generator that transforms available ingredients into 
                  healthy, delicious meals. Built with React and OpenAI's GPT-3.5, it provides 
                  personalized recipes with nutritional information and workout plans.
                </p>
                <MunchMate />
              </div>
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
                  This algorithm uses EEG data and machine learning to control an exoskeleton, helping individuals with stroke or Parkinson's improve mobility
                  and stability. By detecting left or right leaning in under 30 milliseconds with 90% accuracy, it provides real-time feedback to correct posture, 
                  prevent falls, and enable six distinct movement commands.
                </p>
                <BrainActivityChart />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Projects;