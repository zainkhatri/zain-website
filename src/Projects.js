import React, { useState, useCallback, lazy, Suspense, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import roverImage from './rover.jpeg';
import './projects.css';

// Lazy load heavy project components
const MLGame = lazy(() => import('./MLGame'));
const RoverSimulation = lazy(() => import('./RoverSimulation'));
const MunchMate = lazy(() => import('./MunchMate'));
const ManiaJournal = lazy(() => import('./ManiaJournal'));
const MeetYourMaker = lazy(() => import('./MeetYourMaker'));

function Projects() {
  const [areProjectsVisible, setAreProjectsVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const wrapperRef = useRef(null);

  // Measure content height when visibility changes
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      console.log('Content height:', height);
      setContentHeight(height);
    }
  }, [areProjectsVisible]);

  // Add resize observer to update height on content changes
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        console.log('Content size changed:', {
          height: entry.contentRect.height,
          scrollHeight: entry.target.scrollHeight
        });
        setContentHeight(entry.target.scrollHeight);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleProjects = useCallback(() => {
    console.log('Toggle clicked, current state:', areProjectsVisible);
    if (contentRef.current) {
      console.log('Pre-toggle content height:', contentRef.current.scrollHeight);
    }
    setAreProjectsVisible(prev => !prev);
  }, [areProjectsVisible]);

  // Add transition end logging
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleTransitionEnd = (e) => {
      console.log('Transition ended:', e.propertyName);
      if (contentRef.current) {
        console.log('Final content height:', contentRef.current.scrollHeight);
      }
    };

    wrapper.addEventListener('transitionend', handleTransitionEnd);
    return () => wrapper.removeEventListener('transitionend', handleTransitionEnd);
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
              <p className="project-description">
                built an ai-powered chat app that lets people talk to my digital ghost by training on my actual writing samples. features professional/casual modes, voice interaction, and a word hunt puzzle using my vocabulary; basically turned myself into a chatbot.
              </p>
              <Suspense fallback={<div className="loading-spinner">Loading MeetYourMaker...</div>}>
                <MeetYourMaker />
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
                  mania - Digital Journaling App
                </a>
              </h3>
              <p className="project-description">
                built for myself to make journaling feel less like typing into a google doc and more like keeping a real notebook. implemented features to upload photos, write freely, auto save entries, and export everything to pdf. it pulls colors from images to theme the page, and uses gpt-4 to suggest prompts when people get stuck.
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
        </div>
      </div>
    </section>
  );
}

export default memo(Projects);