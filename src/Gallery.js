import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './gallery.css';

// Import preview images
import img4Preview from './images/optimized/4.webp';
import img5Preview from './images/optimized/5.webp';
import img12Preview from './images/optimized/12.webp';
import img13Preview from './images/optimized/13.webp';
import z1Preview from './images/optimized/z1.webp';
import z2Preview from './images/optimized/z2.webp';
import z3Preview from './images/optimized/z3.webp';
import z4Preview from './images/optimized/z4.webp';
import z5Preview from './images/optimized/z5.webp';
import z6Preview from './images/optimized/z6.webp';
import z9Preview from './images/optimized/z9.webp';
import z10Preview from './images/optimized/z10.webp';

// Import full-size images
import img4Full from './images/fullsize/4.webp';
import img5Full from './images/fullsize/5.webp';
import img12Full from './images/fullsize/12.webp';
import img13Full from './images/fullsize/13.webp';
import z1Full from './images/fullsize/z1.webp';
import z2Full from './images/fullsize/z2.webp';
import z3Full from './images/fullsize/z3.webp';
import z4FullHQ from './images/z4.JPG';
import z5Full from './images/fullsize/z5.webp';
import z6Full from './images/fullsize/z6.webp';
import z9Full from './images/fullsize/z9.webp';
import z10Full from './images/fullsize/z10.webp';

function Gallery() {
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const wrapperRef = useRef(null);

  // Array of preview images for the grid
  const previewImages = [
    z4Preview, z3Preview, img5Preview, img4Preview,
    img12Preview, img13Preview, z1Preview, z2Preview,
    z5Preview, z6Preview, z9Preview, z10Preview
  ];

  // Array of full-size images for the modal
  const fullImages = [
    z4FullHQ, z3Full, img5Full, img4Full,
    img12Full, img13Full, z1Full, z2Full,
    z5Full, z6Full, z9Full, z10Full
  ];

  // Measure content height when visibility changes
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [isGalleryVisible]);

  // Add resize observer to update height on content changes
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContentHeight(entry.target.scrollHeight);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

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
    <section id="gallery" className={`content-section gallery ${isGalleryVisible ? 'expanded' : ''}`}>
      <h2 onClick={toggleGallery} className="expandable-title">
        photo gallery {isGalleryVisible ? '-' : '+'}
      </h2>
      <div
        ref={wrapperRef}
        className="content-wrapper"
        style={{
          '--content-height': `${contentHeight}px`
        }}
      >
        <div ref={contentRef} className="content">
          <div className="gallery-grid">
            {previewImages.map((img, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => openImageViewer(index)}
              >
                <img src={img} alt={`Gallery ${index + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

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