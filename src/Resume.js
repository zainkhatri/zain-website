import React from 'react';
import resumePDF from './Zain Khatri 2024.pdf';;
import './bio.css';

function Resume() {
  return (
    <section id="resume" className="content-section resume">
      <h2 onClick={() => window.open(resumePDF, '_blank')} className="expandable-title">
        Resume +
      </h2>
    </section>
  );
}

export default Resume;
