import React from 'react';
import './ManiaJournal.css';

const ManiaJournal = () => {
  const handleIframeLoad = () => {
    console.log('Mania Journal iframe loaded successfully');
  };

  const handleIframeError = (error) => {
    console.error('Mania Journal iframe failed to load:', error);
  };

  return (
    <div className="mania-journal-container">
      <div className="mania-journal-iframe-wrapper">
        <iframe
          src="https://www.maniajournal.org/journal"
          title="Mania Journal"
          className="mania-journal-iframe"
          frameBorder="0"
          allow="camera; microphone; geolocation; clipboard-write; clipboard-read"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          loading="lazy"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
};

export default ManiaJournal; 