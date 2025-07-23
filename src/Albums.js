import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './albums.css';

// Import optimized WebP images
import img1 from './images/optimized/off the wall.webp';
import img2 from './images/optimized/trilogy.webp';
import img3 from './images/optimized/rodeo.webp';
import img4 from './images/optimized/sgrt.webp';
import img5 from './images/optimized/dielit.webp';
import img6 from './images/optimized/tlop.webp';
import img7 from './images/optimized/ctrl.webp';
import img8 from './images/optimized/kendrick lamar.webp';
import img9 from './images/optimized/bleach.webp';
import img10 from './images/optimized/wgo.webp';
import img11 from './images/optimized/testing.webp';
import img12 from './images/optimized/beauty behind the madness.webp';
import img13 from './images/optimized/led zep.webp';
import img14 from './images/optimized/blond.webp';
import img15 from './images/optimized/currents.webp';
import img16 from './images/optimized/astro.webp';
import img17 from './images/optimized/mj.webp';
import img18 from './images/optimized/faces.webp';
import img19 from './images/optimized/love.webp';
import img20 from './images/optimized/utopia.webp';

// Define Spotify links for each album
const spotifyLinks = [
  'https://open.spotify.com/album/2ZytN2cY4Zjrr9ukb2rqTP',
  'https://open.spotify.com/album/2XGEyGU76kj55OdHWynX0S',
  'https://open.spotify.com/album/4PWBTB6NYSKQwfo79I3prg',
  'https://open.spotify.com/album/6QaVfG1pHYl1z15ZxkvVDW',
  'https://open.spotify.com/album/7dAm8ShwJLFm9SaJ6Yc58O',
  'https://open.spotify.com/album/7gsWAHLeT0w7es6FofOXk1',
  'https://open.spotify.com/album/76290XdXVF9rPzGdNRWdCh',
  'https://open.spotify.com/album/6PBZN8cbwkqm1ERj2BGXJ1', 
  'https://open.spotify.com/album/1KVGLuPtrMrLlyy4Je6df7', 
  'https://open.spotify.com/album/2v6ANhWhZBUKkg6pJJBs3B', 
  'https://open.spotify.com/album/3MATDdrpHmQCmuOcozZjDa', 
  'https://open.spotify.com/album/0P3oVJBFOv3TDXlYRhGL7s', 
  'https://open.spotify.com/album/70lQYZtypdCALtFVlQAcvx', 
  'https://open.spotify.com/album/3mH6qwIy9crq0I9YQbOuDf', 
  'https://open.spotify.com/album/79dL7FLiJFOO0EoehUHQBv', 
  'https://open.spotify.com/album/41GuZcammIkupMPKH2OJ6I',
  'https://open.spotify.com/album/2ANVost0y2y52ema1E9xAZ',
  'https://open.spotify.com/album/5SKnXCvB4fcGSZu32o3LRY',
  'https://open.spotify.com/album/2Q2TRdT994vTzGE3Grmmht',
  'https://open.spotify.com/album/18NOKLkZETa4sWwLMIm0UZ'
];

function Albums() {
  const [isAlbumsVisible, setIsAlbumsVisible] = useState(false);

  const toggleAlbums = useCallback(() => {
    setIsAlbumsVisible(!isAlbumsVisible);
  }, [isAlbumsVisible]);

  // Create an array of all album images
  const albumImages = [
    img1, img2, img3, img4, img5, img6, img7, img8, 
    img9, img10, img11, img12, img13, img14, img15, img16,
    img17, img18, img19, img20
  ];

  return (
    <section id="albums" className={`content-section albums ${isAlbumsVisible ? 'expanded-margin' : ''}`}>
      <h2 onClick={toggleAlbums} className="expandable-title">
        music library {isAlbumsVisible ? '-' : '+'}
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
              {albumImages.map((img, index) => (
                <a key={index} href={spotifyLinks[index]} target="_blank" rel="noopener noreferrer" className="albums-item">
                  <img src={img} alt={`Album ${index + 1}`} />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(Albums);