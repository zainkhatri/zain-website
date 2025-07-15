import React from 'react';
import './bio.css';

function Resume() {
  return (
    <section id="resume" className="content-section resume">
      <h2 onClick={() => window.open('/Zain_Khatri_Resume.pdf', '_blank')} className="expandable-title">
        Resume +
      </h2>
    </section>
  );
}

export default Resume;
