import React from 'react';
import resumePDF from './Zain_Khatri_Resume_2025.pdf';
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
