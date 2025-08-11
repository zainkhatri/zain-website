import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './movies.css';

// Movie data
const movieData = [
  {
    title: "Back to the Future",
    link: "https://www.imdb.com/title/tt0088763/",
    year: "1985",
    director: "Robert Zemeckis"
  },
  {
    title: "The Dark Knight",
    link: "https://www.imdb.com/title/tt0468569/",
    year: "2008",
    director: "Christopher Nolan"
  },
  {
    title: "Star Wars: Episode IV - A New Hope",
    link: "https://www.imdb.com/title/tt0076759/",
    year: "1977",
    director: "George Lucas"
  },
  {
    title: "American Psycho",
    link: "https://www.imdb.com/title/tt0144084/",
    year: "2000",
    director: "Mary Harron"
  },
  {
    title: "Napoleon Dynamite",
    link: "https://www.imdb.com/title/tt0374900/",
    year: "2023",
    director: "Ridley Scott"
  },
  {
    title: "Pulp Fiction",
    link: "https://www.imdb.com/title/tt0110912/",
    year: "1994",
    director: "Quentin Tarantino"
  },
  {
    title: "Ratatouille",
    link: "https://www.imdb.com/title/tt0382932/",
    year: "2007",
    director: "Brad Bird"
  },
  {
    title: "Scarface",
    link: "https://www.imdb.com/title/tt0086250/",
    year: "1983",
    director: "Brian De Palma"
  },
  {
    title: "WALL·E",
    link: "https://www.imdb.com/title/tt0910970/",
    year: "2008",
    director: "Andrew Stanton"
  },
  {
    title: "Whiplash",
    link: "https://www.imdb.com/title/tt2582802/",
    year: "2014",
    director: "Damien Chazelle"
  }
];

// Import movie poster images
import backtothefuture from './images/movies/backtothefuture.png';
import darkknight from './images/movies/darkknight.png';
import starwars from './images/movies/starwars.webp';
import ap from './images/movies/ap.jpg';
import nap from './images/movies/nap.jpg';
import pulp from './images/movies/pulp.jpg';
import rat from './images/movies/rat.webp';
import scarface from './images/movies/scarface.jpg';
import walle from './images/movies/walle.webp';
import whiplash from './images/movies/whiplash.webp';

function Movies() {
  const [isMoviesVisible, setIsMoviesVisible] = useState(false);

  const toggleMovies = useCallback(() => {
    setIsMoviesVisible(!isMoviesVisible);
  }, [isMoviesVisible]);

  // Create an array of all movie poster images
  const movieImages = [
    backtothefuture, 
    darkknight, 
    starwars, 
    ap, 
    nap, 
    pulp, 
    rat, 
    scarface, 
    walle, 
    whiplash
  ];

  return (
    <section id="movies" className={`content-section movies ${isMoviesVisible ? 'expanded-margin' : ''}`}>
      <h2 onClick={toggleMovies} className="expandable-title">
        movie library {isMoviesVisible ? '-' : '+'}
      </h2>
      <AnimatePresence>
        {isMoviesVisible && (
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
            <div className="movies-grid">
              {movieImages.map((img, index) => (
                <a key={index} href={movieData[index].link} target="_blank" rel="noopener noreferrer" className="movies-item">
                  <img src={img} alt={movieData[index].title} />
                  <div className="movie-overlay">
                    <span className="movie-title">{movieData[index].title}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(Movies);
