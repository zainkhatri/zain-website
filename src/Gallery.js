import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './gallery.css';

// Import optimized WebP images
import img1 from './images/optimized/1.webp';
import img2 from './images/optimized/2.webp';
import img3 from './images/optimized/3.webp';
import img4 from './images/optimized/4.webp';
import img5 from './images/optimized/5.webp';
import img6 from './images/optimized/6.webp';
import img7 from './images/optimized/7.webp';
import img8 from './images/optimized/8.webp';
import img9 from './images/optimized/9.webp';
import img10 from './images/optimized/10.webp';
import img12 from './images/optimized/12.webp';
import img13 from './images/optimized/13.webp';

function Gallery() {
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);

  const toggleGallery = useCallback(() => {
    setIsGalleryVisible(!isGalleryVisible);
  }, [isGalleryVisible]);

  return (
    <section id="gallery" className={`content-section gallery ${isGalleryVisible ? 'expanded-margin' : ''}`}>
      <h2 onClick={toggleGallery} className="expandable-title">
        photo gallery {isGalleryVisible ? '-' : '+'}
      </h2>
      <AnimatePresence>
        {isGalleryVisible && (
          <motion.div
            className="content expanded"
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: "2000px" }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ 
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            <div className="gallery-grid">
              {[img1, img8, img3, img6, img5, img4, img7, img2, img9, img10, img12, img13].map((img, index) => (
                <div key={index} className="gallery-item">
                  <img src={img} alt={`Gallery ${index + 1}`} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(Gallery);