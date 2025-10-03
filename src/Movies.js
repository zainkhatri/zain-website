import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
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

// Import optimized movie poster images
import backtothefuture from './images/movies/optimized/backtothefuture.webp';
import darkknight from './images/movies/optimized/darkknight.webp';
import starwars from './images/movies/optimized/starwars.webp';
import ap from './images/movies/optimized/ap.webp';
import nap from './images/movies/optimized/nap.webp';
import pulp from './images/movies/optimized/pulp.webp';
import rat from './images/movies/optimized/rat.webp';
import scarface from './images/movies/optimized/scarface.webp';
import walle from './images/movies/optimized/walle.webp';
import whiplash from './images/movies/optimized/whiplash.webp';

function Movies() {
  const [isMoviesVisible, setIsMoviesVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const wrapperRef = useRef(null);

  // Measure content height when visibility changes
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [isMoviesVisible]);

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
    <section id="movies" className={`content-section movies ${isMoviesVisible ? 'expanded' : ''}`}>
      <h2 onClick={toggleMovies} className="expandable-title">
        movie library {isMoviesVisible ? '-' : '+'}
      </h2>
      <div
        ref={wrapperRef}
        className="content-wrapper"
        style={{
          '--content-height': `${contentHeight}px`
        }}
      >
        <div ref={contentRef} className="content">
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
        </div>
      </div>
    </section>
  );
}

export default memo(Movies);
