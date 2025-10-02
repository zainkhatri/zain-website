import React, { memo } from 'react';
import './MeetYourMaker.css';

const MeetYourMaker = () => {
  return (
    <div className="meetyourmaker-container">
      <div className="meetyourmaker-iframe-wrapper">
        <iframe
          src="https://meetyourmaker.vercel.app/"
          className="meetyourmaker-iframe"
          title="MeetYourMaker"
          allow="microphone"
        />
      </div>
    </div>
  );
};

export default memo(MeetYourMaker);
