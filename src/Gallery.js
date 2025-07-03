import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import img1 from './images/1.jpeg';
import img2 from './images/2.jpeg';
import img3 from './images/3.jpeg';
import img4 from './images/4.jpeg';
import img5 from './images/5.jpeg';
import img6 from './images/6.jpeg';
import img7 from './images/7.jpeg';
import img8 from './images/8.jpeg';
import img9 from './images/9.jpeg';
import img10 from './images/10.jpeg';
import img12 from './images/12.jpeg';
import img13 from './images/13.jpeg';

import './gallery.css';

function Gallery() {
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);

  const toggleGallery = () => setIsGalleryVisible(!isGalleryVisible);

  return (
    <section id="gallery" className={`content-section gallery ${isGalleryVisible ? 'expanded-margin' : ''}`}>
      <h2 onClick={toggleGallery} className="expandable-title">
        Photo Gallery {isGalleryVisible ? '-' : '+'}
      </h2>
      <AnimatePresence>
        {isGalleryVisible && (
          <motion.div
            className="content expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="gallery-grid">
              {[img1, img8, img3, img6, img5, img4, img7, img2, img9, img10, img12, img13].map((img, index) => (
                <div key={index} className="gallery-item">
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Gallery;