import React, { useState, useCallback, lazy, Suspense, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import roverImage from './rover.jpeg';
import MeetYourMaker from './MeetYourMaker';
import './projects.css';

// Lazy load heavy project components
const MLGame = lazy(() => import('./MLGame'));
const RoverSimulation = lazy(() => import('./RoverSimulation'));
const MunchMate = lazy(() => import('./MunchMate'));
const ManiaJournal = lazy(() => import('./ManiaJournal'));
const BrainwaveAnimation = lazy(() => import('./BrainwaveAnimation'));

function Projects() {
  const [areProjectsVisible, setAreProjectsVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const wrapperRef = useRef(null);

  // Measure content height when visibility changes
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [areProjectsVisible]);

  // Add resize observer to update height on content changes
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContentHeight(entry.target.scrollHeight);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleProjects = useCallback(() => {
    setAreProjectsVisible(prev => !prev);
  }, []);

  return (
    <section id="projects" className={`content-section projects ${areProjectsVisible ? 'expanded' : ''}`}>
      <h2 onClick={toggleProjects} className="expandable-title">
        projects {areProjectsVisible ? '-' : '+'}
      </h2>
      <div 
        ref={wrapperRef}
        className="content-wrapper"
        style={{
          '--content-height': `${contentHeight}px`
        }}
      >
        <div ref={contentRef} className="content">
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
              <div className="project-description">
                <p className="project-summary">gps-guided autonomous rover built with c and arduino for navigating rough terrain</p>
                <ul className="project-features">
                  <li>obstacle avoidance with ultrasonic sensors and waypoint navigation logic</li>
                  <li>magnetometer + gps integration for autonomous path planning</li>
                  <li>custom chassis design with 3d printing and full electronics assembly</li>
                </ul>
              </div>
              {/* Rover Simulation */}
              <div className="rover-simulation">
                <Suspense fallback={null}>
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

          {/* UC Berkeley Exoskeleton Brainwave Algorithm Project */}
          <div className="project">
            <div className="project-content">
              <h3 className="project-title">
                <a
                  href="https://github.com/zainkhatri/exoskeleton-brainwave-algorithm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UC Berkeley URAP Exoskeleton Brainwave Algorithm
                </a>
              </h3>
              <div className="project-description">
                <p className="project-summary">python toolkit for analyzing eeg/eog signals to predict gaze direction using machine learning</p>
                <ul className="project-features">
                  <li>signal processing pipeline with bandpass filtering and artifact removal</li>
                  <li>trained random forest, svm, and neural networks for gaze prediction</li>
                  <li>real-time brainwave visualization across delta, theta, alpha, beta, gamma bands</li>
                </ul>
              </div>
              <Suspense fallback={null}>
                <BrainwaveAnimation />
              </Suspense>
            </div>
          </div>

          {/* MeetYourMaker Project */}
          <div className="project">
            <div className="project-content">
              <h3 className="project-title">
                <a
                  href="https://meetyourmaker.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  meetyourmaker - Digital Twin Chat
                </a>
              </h3>
              <div className="project-description">
                <p className="project-summary">ai chatbot trained on my personal writing to create a digital twin with my voice and personality</p>
                <ul className="project-features">
                  <li>professional/casual mode switching for different conversation contexts</li>
                  <li>voice interaction with speech-to-text and text-to-speech capabilities</li>
                  <li>word hunt puzzle game using my actual vocabulary patterns</li>
                </ul>
              </div>
              <MeetYourMaker />
            </div>
          </div>

          {/* Mania Journal Project */}
          <div className="project mania-project">
            <div className="project-content">
              <h3 className="project-title">
                <a
                  href="https://maniajournal.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  mania - Digital Journaling App
                </a>
              </h3>
              <div className="project-description">
                <p className="project-summary">digital journaling app designed to recreate the feel of a physical notebook</p>
                <ul className="project-features">
                  <li>photo uploads with automatic color extraction for dynamic theming</li>
                  <li>gpt-4 powered writing prompts for creative inspiration</li>
                  <li>auto-save functionality and pdf export for all entries</li>
                </ul>
              </div>
              <Suspense fallback={null}>
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
              <div className="project-description">
                <p className="project-summary">speed-based number clicking game challenging players to find numbers 1-50 as fast as possible</p>
                <ul className="project-features">
                  <li>real-time performance tracking with accuracy metrics</li>
                  <li>global leaderboard system for competitive play</li>
                  <li>responsive design built in react with optimized rendering</li>
                </ul>
              </div>
              <Suspense fallback={null}>
                <MLGame />
              </Suspense>
            </div>
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
              <div className="project-description">
                <p className="project-summary">ai recipe generator that transforms leftover ingredients into meals with nutrition info</p>
                <ul className="project-features">
                  <li>openai gpt-3.5 integration for creative recipe suggestions</li>
                  <li>dietary filters and goal-based recommendations (weight loss, muscle gain, etc)</li>
                  <li>optional workout suggestions paired with meal macros</li>
                </ul>
              </div>
              <Suspense fallback={null}>
                <MunchMate />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Projects);