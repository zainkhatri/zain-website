import React from 'react';
import './ManiaJournal.css';

const ManiaJournal = () => {
  return (
    <div className="mania-journal-container">
      <div className="mania-journal-iframe-wrapper">
        <iframe
          src="https://mania-zain-website.vercel.app/journal"
          title="Mania Journal"
          className="mania-journal-iframe"
          frameBorder="0"
          allow="camera; microphone; geolocation"
        />
      </div>
    </div>
  );
};

export default ManiaJournal; 