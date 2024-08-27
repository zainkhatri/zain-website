import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import img1 from './images/mj.jpeg';
import img2 from './images/trilogy.jpeg';
import img3 from './images/rodeo.jpeg';
import img4 from './images/sgrt.jpeg';
import img5 from './images/dielit.jpeg';
import img6 from './images/tlop.jpeg';
import img7 from './images/ctrl.jpeg';
import img8 from './images/enis.jpeg';
import img9 from './images/bleach.jpeg';
import img10 from './images/wgo.jpeg';
import img11 from './images/testing.jpeg';
import img12 from './images/dfmb.jpeg';
import './albums.css';

function Albums() {
  const [isAlbumsVisible, setIsAlbumsVisible] = useState(false);

  const toggleAlbums = () => setIsAlbumsVisible(!isAlbumsVisible);

  const images = [
    img1, img2, img3, img4, img5, img6,
    img7, img8, img9, img10, img11, img12,
  ];

  return (
    <section id="albums" className="content-section albums">
      <h2 onClick={toggleAlbums} className="expandable-title">
      Essential Albums {isAlbumsVisible ? '-' : '+'}
      </h2>
      <AnimatePresence>
        {isAlbumsVisible && (
          <motion.div
            className="content expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="albums-grid">
              {images.map((img, index) => (
                <div key={index} className="albums-item">
                  <img src={img} alt={`Albums ${index + 1}`} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Albums;
