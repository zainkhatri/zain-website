import React, { useState, useCallback, useEffect, memo } from 'react';
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [img1, img8, img3, img6, img5, img4, img7, img2, img9, img10, img12, img13];

  const toggleGallery = useCallback(() => {
    setIsGalleryVisible(!isGalleryVisible);
  }, [isGalleryVisible]);

  const openImageViewer = useCallback((index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  }, [images]);

  const closeImageViewer = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const goToNextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % images.length;
      setSelectedImage(images[nextIndex]);
      return nextIndex;
    });
  }, [images]);

  const goToPrevImage = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex - 1 + images.length) % images.length;
      setSelectedImage(images[nextIndex]);
      return nextIndex;
    });
  }, [images]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      
      switch (e.key) {
        case 'ArrowRight':
          goToNextImage();
          break;
        case 'ArrowLeft':
          goToPrevImage();
          break;
        case 'Escape':
          closeImageViewer();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, goToNextImage, goToPrevImage, closeImageViewer]);

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
              {images.map((img, index) => (
                <motion.div 
                  key={index} 
                  className="gallery-item"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => openImageViewer(index)}
                >
                  <img src={img} alt={`Gallery ${index + 1}`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="image-viewer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageViewer}
          >
            <motion.div 
              className="image-viewer-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="nav-button prev" onClick={goToPrevImage}>
                <span>←</span>
              </button>
              <div className="image-container">
                <motion.img 
                  key={currentIndex}
                  src={selectedImage} 
                  alt={`Gallery ${currentIndex + 1}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              </div>
              <button className="nav-button next" onClick={goToNextImage}>
                <span>→</span>
              </button>
              <button className="close-button" onClick={closeImageViewer}>
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(Gallery);