import React, { useState, useCallback, lazy, Suspense, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import roverImage from './rover.jpeg';
import './projects.css';

// Lazy load heavy project components
const MLGame = lazy(() => import('./MLGame'));
const RoverSimulation = lazy(() => import('./RoverSimulation'));
const BrainActivityChart = lazy(() => import('./BrainActivityChart'));
const MunchMate = lazy(() => import('./MunchMate'));
const ManiaJournal = lazy(() => import('./ManiaJournal'));

function Projects() {
  const [areProjectsVisible, setAreProjectsVisible] = useState(false);
  const contentRef = useRef(null);

  const toggleProjects = useCallback(() => {
    setAreProjectsVisible((prev) => !prev);
  }, []);

  return (
    <section id="projects" className="content-section projects">
      <h2 onClick={toggleProjects} className="expandable-title">
        projects {areProjectsVisible ? '-' : '+'}
      </h2>
      <div className="content-wrapper">
        <AnimatePresence mode="wait">
          {areProjectsVisible && (
            <motion.div
              ref={contentRef}
              className="content expanded"
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ 
                duration: 0.4,
                height: {
                  duration: 0.4,
                  ease: [0.32, 0.72, 0, 1]
                },
                scale: {
                  duration: 0.3,
                  ease: [0.32, 0.72, 0, 1]
                }
              }}
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
                    built a gps guided rover using c and arduino. handled obstacle avoidance, waypoint logic, and custom chassis design. integrated magnetometer + gps data to autonomously navigate rough terrain. included soldering, 3d printing, and full system calibration.
                  </p>
                  {/* Rover Simulation */}
                  <div className="rover-simulation">
                    <Suspense fallback={<div className="loading-spinner">Loading Rover Simulation...</div>}>
                      <RoverSimulation />
                    </Suspense>
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
                    ai powered meal generator that converts leftover ingredients into recipes, macros, and optional workouts. built with react and openai gpt-3.5. added dietary filters, goal-based suggestions, and a lightweight frontend for fast user input/output.
                  </p>
                  <Suspense fallback={<div className="loading-spinner">Loading MunchMate...</div>}>
                    <MunchMate />
                  </Suspense>
                </div>
              </div>

              {/* Mania Journal Project */}
              <div className="project mania-project">
                <div className="project-content">
                  <h3 className="project-title">
                    <a
                      href="https://github.com/zainkhatri/mania"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Mania - Digital Journaling App
                    </a>
                  </h3>
                  <p className="project-description">
                    built for myself to make journaling feel less like typing into a google doc and more like keeping a real notebook. implemented features to  upload photos, write freely, auto save entries, and export everything to pdf. it pulls colors from images to theme the page, and uses gpt-4 to suggest prompts when people get stuck.
                  </p>
                  <Suspense fallback={<div className="loading-spinner">Loading Mania Journal...</div>}>
                    <ManiaJournal />
                  </Suspense>
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
                      Eagle Eye
                    </a>
                  </h3>
                  <p className="project-description">
                    speed based number clicking game from 1 to 50. tracks time, accuracy, and leaderboard position. built in react and deployed as a web app.
                  </p>
                  <Suspense fallback={<div className="loading-spinner">Loading Eagle Eye Game...</div>}>
                    <MLGame />
                  </Suspense>
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
                    developed a real time eeg classifier to detect lean direction in under 30ms for stroke/parkinson's movement assistance. built and tuned an svm pipeline with gpu acceleration. achieved 90%+ accuracy. used to control a physical exoskeleton for posture correction and mobility aid.
                  </p>
                  <Suspense fallback={<div className="loading-spinner">Loading Brain Activity Chart...</div>}>
                    <BrainActivityChart />
                  </Suspense>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default memo(Projects);