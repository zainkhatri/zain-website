import React, { useState, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './gallery.css';

// Import preview images
import img1Preview from './images/optimized/1.webp';
import img2Preview from './images/optimized/2.webp';
import img3Preview from './images/optimized/3.webp';
import img4Preview from './images/optimized/4.webp';
import img5Preview from './images/optimized/5.webp';
import img6Preview from './images/optimized/6.webp';
import img7Preview from './images/optimized/7.webp';
import img8Preview from './images/optimized/8.webp';
import img9Preview from './images/optimized/9.webp';
import img10Preview from './images/optimized/10.webp';
import img12Preview from './images/optimized/12.webp';
import img13Preview from './images/optimized/13.webp';

// Import full-size images
import img1Full from './images/fullsize/1.webp';
import img2Full from './images/fullsize/2.webp';
import img3Full from './images/fullsize/3.webp';
import img4Full from './images/fullsize/4.webp';
import img5Full from './images/fullsize/5.webp';
import img6Full from './images/fullsize/6.webp';
import img7Full from './images/fullsize/7.webp';
import img8Full from './images/fullsize/8.webp';
import img9Full from './images/fullsize/9.webp';
import img10Full from './images/fullsize/10.webp';
import img12Full from './images/fullsize/12.webp';
import img13Full from './images/fullsize/13.webp';

function Gallery() {
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of preview images for the grid
  const previewImages = [
    img1Preview, img8Preview, img3Preview, img6Preview, img5Preview, 
    img4Preview, img7Preview, img2Preview, img9Preview, img10Preview, 
    img12Preview, img13Preview
  ];

  // Array of full-size images for the modal
  const fullImages = [
    img1Full, img8Full, img3Full, img6Full, img5Full, 
    img4Full, img7Full, img2Full, img9Full, img10Full, 
    img12Full, img13Full
  ];

  const toggleGallery = useCallback(() => {
    setIsGalleryVisible(!isGalleryVisible);
  }, [isGalleryVisible]);

  const openImageViewer = useCallback((index) => {
    setCurrentIndex(index);
    setSelectedImage(fullImages[index]); // Use full-size image in modal
  }, [fullImages]);

  const closeImageViewer = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const goToNextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % fullImages.length;
      setSelectedImage(fullImages[nextIndex]); // Use full-size image
      return nextIndex;
    });
  }, [fullImages]);

  const goToPrevImage = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex - 1 + fullImages.length) % fullImages.length;
      setSelectedImage(fullImages[nextIndex]); // Use full-size image
      return nextIndex;
    });
  }, [fullImages]);

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
              {previewImages.map((img, index) => (
                <motion.div 
                  key={index} 
                  className="gallery-item"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => openImageViewer(index)}
                >
                  <img src={img} alt={`Gallery ${index + 1}`} loading="lazy" />
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