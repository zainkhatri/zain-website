import React, { memo, useState, useEffect, useRef } from 'react';
import './MeetYourMaker.css';

const MeetYourMaker = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.5,
        rootMargin: '-50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="meetyourmaker-container">
      <div className="meetyourmaker-iframe-wrapper">
        {isVisible && (
          <iframe
            src="https://meetyourmaker.vercel.app/"
            className="meetyourmaker-iframe"
            title="MeetYourMaker"
          />
        )}
      </div>
    </div>
  );
};

export default memo(MeetYourMaker);
