import React, { useState } from 'react';
import img1 from './images/1.jpeg';
import img2 from './images/2.jpeg';
import img3 from './images/3.jpeg';
import img4 from './images/4.jpeg';
import img5 from './images/5.jpeg';
import img6 from './images/6.jpeg';
import img7 from './images/7.jpeg';
import img8 from './images/8.jpeg';
import './gallery.css';

function Gallery() {
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);

  const toggleGallery = () => setIsGalleryVisible(!isGalleryVisible);

  return (
    <section id="gallery" className="content-section gallery">
      <h2 onClick={toggleGallery} className="expandable-title">
        Photo Gallery {isGalleryVisible ? '-' : '+'}
      </h2>
      <div className={`content ${isGalleryVisible ? 'expanded' : ''}`}>
        <div className="gallery-grid">
          {[img2, img4, img6, img1, img5, img8, img7, img3].map((img, index) => (
            <div key={index} className="gallery-item">
              <img src={img} alt={`Gallery ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
