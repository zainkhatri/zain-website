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

// Define Spotify links for each album
const spotifyLinks = [
  'https://open.spotify.com/album/2ANVost0y2y52ema1E9xAZ',
  'https://open.spotify.com/album/2XGEyGU76kj55OdHWynX0S',
  'https://open.spotify.com/album/4PWBTB6NYSKQwfo79I3prg',
  'https://open.spotify.com/album/6QaVfG1pHYl1z15ZxkvVDW',
  'https://open.spotify.com/album/7dAm8ShwJLFm9SaJ6Yc58O',
  'https://open.spotify.com/album/7gsWAHLeT0w7es6FofOXk1',
  'https://open.spotify.com/album/76290XdXVF9rPzGdNRWdCh',
  'https://open.spotify.com/album/7ycBtnsMtyVbbwTfJwRjSP', 
  'https://open.spotify.com/album/1KVGLuPtrMrLlyy4Je6df7', 
  'https://open.spotify.com/album/2v6ANhWhZBUKkg6pJJBs3B', 
  'https://open.spotify.com/album/3MATDdrpHmQCmuOcozZjDa', 
  'https://open.spotify.com/album/7Cw4LObzgnVqSlkuIyywtI', 
];

function Albums() {
  const [isAlbumsVisible, setIsAlbumsVisible] = useState(false);

  const toggleAlbums = () => setIsAlbumsVisible(!isAlbumsVisible);

  return (
    <section id="albums" className={`content-section albums ${isAlbumsVisible ? 'expanded-margin' : ''}`}>
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
              {[img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12].map((img, index) => (
                <a key={index} href={spotifyLinks[index]} target="_blank" rel="noopener noreferrer" className="albums-item">
                  <img src={img} alt={`Albums ${index + 1}`} />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Albums;
