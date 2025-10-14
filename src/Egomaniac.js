import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import './Egomaniac.css';

import ego1 from './images/ego-optimized/ego1.jpg';
import ego2 from './images/ego-optimized/ego2.jpg';
import ego3 from './images/ego-optimized/ego3.jpg';
import ego4 from './images/ego-optimized/ego4.jpg';
import ego5 from './images/ego-optimized/ego5.jpg';
import ego6 from './images/ego-optimized/ego6.jpg';
import ego7 from './images/ego-optimized/ego7.jpg';
import ego8 from './images/ego-optimized/ego8.jpg';
import ego9 from './images/ego-optimized/ego9.jpg';
import ego10 from './images/ego-optimized/ego10.jpg';
import ego11 from './images/ego-optimized/ego11.jpg';
import ego12 from './images/ego-optimized/ego12.jpg';

const UNSPLASH_PLACEHOLDER_PATTERN = /^%.*%$/;

function sanitizeEnvValue(value) {
  if (value === undefined || value === null) {
    return '';
  }

  const trimmed = String(value).trim();

  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    UNSPLASH_PLACEHOLDER_PATTERN.test(trimmed)
  ) {
    return '';
  }

  return trimmed;
}

function resolveUnsplashAccessKey() {
  const candidates = [];

  if (typeof process !== 'undefined' && process.env) {
    candidates.push(
      process.env.REACT_APP_UNSPLASH_ACCESS_KEY,
      process.env.VITE_UNSPLASH_ACCESS_KEY,
      process.env.UNSPLASH_ACCESS_KEY
    );
  }

  if (typeof globalThis !== 'undefined') {
    const maybeWindow = globalThis;
    candidates.push(
      maybeWindow.REACT_APP_UNSPLASH_ACCESS_KEY,
      maybeWindow.VITE_UNSPLASH_ACCESS_KEY,
      maybeWindow.UNSPLASH_ACCESS_KEY
    );
  }

  let metaEnv;
  try {
    // eslint-disable-next-line no-eval
    metaEnv = eval('import.meta')?.env;
  } catch (error) {
    metaEnv = undefined;
  }

  if (metaEnv) {
    candidates.push(metaEnv.VITE_UNSPLASH_ACCESS_KEY, metaEnv.REACT_APP_UNSPLASH_ACCESS_KEY);
  }

  for (const candidate of candidates) {
    const sanitized = sanitizeEnvValue(candidate);
    if (sanitized) {
      return sanitized;
    }
  }

  return '';
}

const foodRecommendations = [
  {
    id: 2,
    name: "Zareens",
    description: "White man's Pakistani food, but its perfect. It's just perfect. The sizzler, the lamb gosht, the MANGO LASSI bruv. It's beautiful. It's one of, if not the best place to eat in the Bay Area.",
    food: "Chicken Sizzler, Chicken Tikka Masala, Lamb Gosht, Chapli Kabob, Mango Lassi",
    city: "Palo Alto, CA",
    region: "Downtown Palo Alto",
    rating: 10,
    coordinates: { lat: 37.4292, lng: -122.1381 },
    address: "365 California Ave, Palo Alto, CA 94306"
  },
  {
    id: 1,
    name: "Chutney",
    description: "Authentic Pakistani food in the absolute ghetto WORST of San Francisco. It's the best Chicken Tikka Masala in the world. I will stand on that. Khabib put everyone on too, but my hood and I been coming here since 2006. ",
    food: "Chicken Tikka Masala, Lamb Masala, Chicken Tandoori Leg",
    city: "San Francisco, CA",
    region: "Tenderloin",
    rating: 9.7,
    coordinates: { lat: 37.7825, lng: -122.4131 },
    address: "511 Jones St, San Francisco, CA 94102"
  },
  {
    id: 7,
    name: "De Afghanan",
    description: "The kabobs are so good. The meat is mad tender. It's a little tax, but still its fire.",
    food: "Chapli Kabob, Mantu, Bolani, Chicken Kabob",
    city: "Fremont, CA",
    region: "Fremont Blvd",
    rating: 9,
    coordinates: { lat: 37.5476, lng: -121.9886 },
    address: "37395 Fremont Blvd, Fremont, CA 94536"
  },
  {
    id: 3,
    name: "La Vaca's Tacos",
    description: "Underrated spot in the Mission District. Taste of Tiana put me on, and I was so ready to hate on her. But it was good. Super interesting flavors, it was just solid. Best tacos in the Bay? I thinks so.",
    food: "Blue Corn Birria Tacos",
    city: "San Francisco, CA",
    region: "Mission District",
    rating: 9,
    coordinates: { lat: 37.7524, lng: -122.4095 },
    address: "2962 24th St, San Francisco, CA 94110"
  },
  {
    id: 4,
    name: "Bibo's Pizza",
    description: "Solid SJ pizza. It was the spot in CC, and it's just reallys solid hommey pizza. It's not the BEST ever, but it's really reliable and good.",
    food: "Mediterranean Pizza, Buffalo Chicken Pizz, Hawaiian Pizza (No Bacon)",
    city: "San Jose, CA",
    region: "Willow Glen Village",
    rating: 9,
    coordinates: { lat: 37.3008, lng: -121.8947 },
    address: "1431 Bird Ave., San Jose, CA 95125"
  },
  {
    id: 6,
    name: "Burger Shop",
    description: "The OG Halal Smashburger. It's just really solid. The bacon too. Wow",
    food: "Halal Smashburger",
    city: "Union City, CA",
    region: "Smith Street",
    rating: 8.3,
    coordinates: { lat: 37.5933, lng: -122.0438 },
    address: "3851 Smith Street, Union City, CA"
  },
  {
    id: 5,
    name: "Qamaria Yemeni Coffee Co.",
    description: "It used to be shorty central, then all the aunties and uncs ruined it. It's good though, solid vibes, the food is mid, but I like the desserts and location",
    food: "Iced Pistachio Latte, Honeycomb Pastry",
    city: "Fremont, CA",
    region: "Cushing",
    rating: 8,
    coordinates: { lat: 37.5485, lng: -121.9886 },
    address: "4193 Cushing Pkwy, Fremont, CA 94538"
  }
];

const egoImages = [
  { id: 1, title: "Ego 1", image: ego1 },
  { id: 2, title: "Ego 2", image: ego2 },
  { id: 3, title: "Ego 3", image: ego3 },
  { id: 4, title: "Ego 4", image: ego4 },
  { id: 5, title: "Ego 5", image: ego5 },
  { id: 6, title: "Ego 6", image: ego6 },
  { id: 7, title: "Ego 7", image: ego7 },
  { id: 8, title: "Ego 8", image: ego8 },
  { id: 9, title: "Ego 9", image: ego9 },
  { id: 10, title: "Ego 10", image: ego10 },
  { id: 11, title: "Ego 11", image: ego11 },
  { id: 12, title: "Ego 12", image: ego12 }
];

const DEFAULT_CENTER = [37.5, -122.2];
const DEFAULT_ZOOM = 8;

const MapFocus = ({ restaurant, isVisible }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !isVisible) {
      return;
    }

    const zoom = restaurant ? 13 : DEFAULT_ZOOM;
    const baseLatLng = restaurant
      ? L.latLng(restaurant.coordinates.lat, restaurant.coordinates.lng)
      : L.latLng(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);

    const mapSize = map.getSize();
    // Smaller offset - restaurant appears lower/more centered
    const offsetFactor = restaurant ? 0.15 : 0.08;
    const verticalOffset = mapSize.y * offsetFactor;

    const projected = map.project(baseLatLng, zoom);
    const offsetPoint = projected.add([0, verticalOffset]);
    const targetLatLng = map.unproject(offsetPoint, zoom);

    map.flyTo(targetLatLng, zoom, { duration: 0.7 });
  }, [map, restaurant, isVisible]);

  return null;
};

const RestaurantMarkers = memo(function RestaurantMarkers({ restaurants, icons, onSelect }) {
  return (
    <>
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.coordinates.lat, restaurant.coordinates.lng]}
          icon={icons[restaurant.id]}
          eventHandlers={{ click: () => onSelect(restaurant) }}
        />
      ))}
    </>
  );
});

function Egomaniac() {
  const [isFlicksVisible, setIsFlicksVisible] = useState(false);
  const [isMunchVisible, setIsMunchVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(foodRecommendations[0]);
  const [mapInstance, setMapInstance] = useState(null);
  const unsplashAccessKey = resolveUnsplashAccessKey();
  const [galleryState, setGalleryState] = useState({ status: 'idle', items: [] });
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const galleryItems = galleryState.items;
  const selectedPhoto =
    selectedPhotoIndex !== null && galleryItems[selectedPhotoIndex]
      ? galleryItems[selectedPhotoIndex]
      : null;
  const flicksContentRef = useRef(null);
  const munchContentRef = useRef(null);
  const [flicksHeight, setFlicksHeight] = useState(0);
  const [munchHeight, setMunchHeight] = useState(0);
  const [selectedFlickIndex, setSelectedFlickIndex] = useState(null);
  const selectedFlick = selectedFlickIndex !== null ? egoImages[selectedFlickIndex] : null;

  useEffect(() => {
    if (!mapInstance || !isMunchVisible) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      if (mapInstance?._size && mapInstance?._mapPane) {
        mapInstance.invalidateSize();
      }
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [mapInstance, isMunchVisible]);

  useEffect(() => {
    if (!selectedRestaurant || !unsplashAccessKey) {
      setGalleryState({ status: unsplashAccessKey ? 'idle' : 'missing-key', items: [] });
      setSelectedPhotoIndex(null);
      requestAnimationFrame(() => {
        if (munchContentRef.current) {
          setMunchHeight(munchContentRef.current.scrollHeight);
        }
      });
      return undefined;
    }

    const controller = new AbortController();
    const searchQuery = `${selectedRestaurant.name} ${selectedRestaurant.city}`;

    setGalleryState((prev) => ({ status: 'loading', items: prev.items }));

    const fetchPhotos = async () => {
      try {
        const params = new URLSearchParams({
          query: searchQuery,
          per_page: '6',
          orientation: 'landscape',
          content_filter: 'high',
        });

        const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
          headers: {
            Authorization: `Client-ID ${unsplashAccessKey}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unsplash request failed: ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : [];

        const photos = results.slice(0, 6).map((photo) => ({
          id: photo.id,
          src: photo.urls?.small ?? photo.urls?.regular ?? photo.urls?.thumb ?? '',
          fullSrc: photo.urls?.regular ?? photo.urls?.full ?? photo.urls?.small ?? '',
          alt:
            photo.alt_description ||
            photo.description ||
            `${selectedRestaurant.name} photo`,
          photographer: photo.user?.name,
          photographerUrl: photo.user?.links?.html,
        }));
        setGalleryState({ status: 'success', items: photos });
        setSelectedPhotoIndex(null);
        requestAnimationFrame(() => {
          if (munchContentRef.current) {
            setMunchHeight(munchContentRef.current.scrollHeight);
          }
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        console.error('Error fetching Unsplash images:', error);
        setGalleryState({ status: 'error', items: [] });
        setSelectedPhotoIndex(null);
        requestAnimationFrame(() => {
          if (munchContentRef.current) {
            setMunchHeight(munchContentRef.current.scrollHeight);
          }
        });
      }
    };

    fetchPhotos();

    return () => controller.abort();
  }, [selectedRestaurant, unsplashAccessKey]);

  useEffect(() => {
    if (!flicksContentRef.current) {
      return undefined;
    }

    const element = flicksContentRef.current;
    const updateHeight = () => setFlicksHeight(element.scrollHeight);
    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!munchContentRef.current) {
      return undefined;
    }

    const element = munchContentRef.current;
    const updateHeight = () => setMunchHeight(element.scrollHeight);
    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedPhotoIndex === null) {
      return;
    }

    if (!galleryItems[selectedPhotoIndex]) {
      setSelectedPhotoIndex(galleryItems.length ? 0 : null);
    }
  }, [galleryItems, selectedPhotoIndex]);

  useEffect(() => {
    if (selectedPhotoIndex === null) {
      return undefined;
    }

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (event.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => {
          if (prev === null || galleryItems.length === 0) return prev;
          return (prev + 1) % galleryItems.length;
        });
      } else if (event.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => {
          if (prev === null || galleryItems.length === 0) return prev;
          return (prev - 1 + galleryItems.length) % galleryItems.length;
        });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [galleryItems, selectedPhotoIndex]);

  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [selectedPhotoIndex]);

  useEffect(() => {
    if (!isFlicksVisible || !flicksContentRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      if (flicksContentRef.current) {
        setFlicksHeight(flicksContentRef.current.scrollHeight);
      }
    });
  }, [isFlicksVisible]);

  useEffect(() => {
    if (!munchContentRef.current || !isMunchVisible) {
      return;
    }

    requestAnimationFrame(() => {
      if (munchContentRef.current) {
        setMunchHeight(munchContentRef.current.scrollHeight);
      }
    });
  }, [isMunchVisible, selectedRestaurant, galleryState.status, galleryItems.length]);

  const markerIcons = useMemo(() => {
    return foodRecommendations.reduce((acc, restaurant) => {
      const isSelected = selectedRestaurant?.id === restaurant.id;

      acc[restaurant.id] = L.divIcon({
        className: 'ego-marker-wrapper',
        html: `<span class="ego-marker ${isSelected ? 'active' : ''}"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      return acc;
    }, {});
  }, [selectedRestaurant]);

  const toggleFlicks = () => {
    setIsFlicksVisible((prev) => !prev);
  };

  const toggleMunch = () => {
    setIsMunchVisible((prev) => !prev);
  };

  const openFlick = useCallback((index) => {
    setSelectedFlickIndex(index);
  }, []);

  const closeFlick = useCallback(() => {
    setSelectedFlickIndex(null);
  }, []);

  const goToNextFlick = useCallback(() => {
    setSelectedFlickIndex((prevIndex) => 
      prevIndex !== null ? (prevIndex + 1) % egoImages.length : 0
    );
  }, []);

  const goToPrevFlick = useCallback(() => {
    setSelectedFlickIndex((prevIndex) => 
      prevIndex !== null ? (prevIndex - 1 + egoImages.length) % egoImages.length : 0
    );
  }, []);

  const handleRestaurantClick = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedFlickIndex === null) return;
      
      switch (e.key) {
        case 'ArrowRight':
          goToNextFlick();
          break;
        case 'ArrowLeft':
          goToPrevFlick();
          break;
        case 'Escape':
          closeFlick();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFlickIndex, goToNextFlick, goToPrevFlick, closeFlick]);

  const renderStars = (rating) => {
    const totalStars = 5;
    const normalized = Math.max(0, Math.min(rating / 2, totalStars)); // 0–10 → 0–5

    return Array.from({ length: totalStars }, (_, i) => {
      const diff = normalized - i;
      if (diff >= 1) return <span key={i} className="star filled"></span>;
      if (diff >= 0.5) return <span key={i} className="star half"></span>;
      return <span key={i} className="star empty"></span>;
    });
  };

  const handleOpenPhoto = useCallback(
    (index) => {
      if (!galleryItems[index]) {
        return;
      }
      setSelectedPhotoIndex(index);
    },
    [galleryItems]
  );

  const handleClosePhoto = useCallback(() => {
    setSelectedPhotoIndex(null);
  }, []);

  const handleNextPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => {
      if (prev === null || galleryItems.length === 0) {
        return prev;
      }
      return (prev + 1) % galleryItems.length;
    });
  }, [galleryItems.length]);

  const handlePrevPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => {
      if (prev === null || galleryItems.length === 0) {
        return prev;
      }
      return (prev - 1 + galleryItems.length) % galleryItems.length;
    });
  }, [galleryItems.length]);

  return (
    <div className="egomaniac-container">
      <section
        className={`content-section egomaniac-section flicks-section ${isFlicksVisible ? 'expanded' : ''}`}
      >
        <h2 onClick={toggleFlicks} className="expandable-title egomaniac-title regular-font">
          flicks <span className="toggle-symbol">{isFlicksVisible ? '-' : '+'}</span>
        </h2>
        <div className="content-wrapper" style={{ '--content-height': `${flicksHeight}px` }}>
          <div ref={flicksContentRef} className="content egomaniac-content">
            <div className="ego-grid">
              {egoImages.map((egoImage, index) => (
                <div 
                  key={egoImage.id} 
                  className="ego-item clickable"
                  onClick={() => openFlick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openFlick(index);
                    }
                  }}
                >
                  <img src={egoImage.image} alt={egoImage.title} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedFlick && (
          <motion.div
            className="egomaniac-lightbox flicks-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeFlick}
          >
            <button type="button" className="lightbox-close" onClick={closeFlick} aria-label="Close photo">
              ×
            </button>
            <button 
              type="button" 
              className="lightbox-nav lightbox-prev" 
              onClick={(e) => { e.stopPropagation(); goToPrevFlick(); }}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button 
              type="button" 
              className="lightbox-nav lightbox-next" 
              onClick={(e) => { e.stopPropagation(); goToNextFlick(); }}
              aria-label="Next photo"
            >
              ›
            </button>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={selectedFlick.image} alt={selectedFlick.title} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section
        className={`content-section egomaniac-section munch-section ${isMunchVisible ? 'expanded' : ''}`}
      >
        <h2 onClick={toggleMunch} className="expandable-title egomaniac-title regular-font">
          good munch <span className="toggle-symbol">{isMunchVisible ? '-' : '+'}</span>
        </h2>
        <div className="content-wrapper" style={{ '--content-height': `${munchHeight}px` }}>
          <div ref={munchContentRef} className="content egomaniac-content">
            <div className="munch-layout">
              <div className="restaurants-list">
                {foodRecommendations.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`restaurant-card ${selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <div className="restaurant-header">
                      <h3 className="restaurant-name">{restaurant.name}</h3>
                    </div>
                    <div className="restaurant-score">
                      <span className="score-value">{restaurant.rating}</span>
                      <span className="score-max">/10</span>
                    </div>
                    <div className="restaurant-stars">
                      <div className="stars">{renderStars(restaurant.rating)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="map-container">
                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={DEFAULT_ZOOM}
                  minZoom={4}
                  maxZoom={16}
                  scrollWheelZoom={false}
                  className="ego-map"
                  whenReady={({ target }) => setMapInstance(target)}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <RestaurantMarkers
                    restaurants={foodRecommendations}
                    icons={markerIcons}
                    onSelect={handleRestaurantClick}
                  />
                  <MapFocus restaurant={selectedRestaurant} isVisible={isMunchVisible} />
                </MapContainer>

                {selectedRestaurant && (
                  <div className="selected-restaurant-info" key={selectedRestaurant.id}>
                    <div className="info-wrap">
                      <h4>{selectedRestaurant.name}</h4>
                      <p>{selectedRestaurant.description}</p>
                      <div className="rating-display">
                        <div className="rating-badge">
                          <span className="rating-number">{selectedRestaurant.rating}</span>
                          <span className="rating-max">/10</span>
                        </div>
                        <div className="stars">{renderStars(selectedRestaurant.rating)}</div>
                      </div>
                      <div className="info-detail">
                        <span className="info-label">Location</span>
                        <span className="info-value">
                          {selectedRestaurant.city} &middot; {selectedRestaurant.region}
                        </span>
                      </div>
                      <div className="info-detail">
                        <span className="info-label">Standouts</span>
                        <span className="info-value">{selectedRestaurant.food}</span>
                      </div>
                      <div className="info-detail">
                        <span className="info-label">Address</span>
                        <span className="info-value">{selectedRestaurant.address}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="egomaniac-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                handleClosePhoto();
              }
            }}
          >
            <button type="button" className="lightbox-close" onClick={handleClosePhoto} aria-label="Close photo">
              ×
            </button>
            {galleryItems.length > 1 && (
              <>
                <button type="button" className="lightbox-nav prev" onClick={handlePrevPhoto} aria-label="Previous photo">
                  ‹
                </button>
                <button type="button" className="lightbox-nav next" onClick={handleNextPhoto} aria-label="Next photo">
                  ›
                </button>
              </>
            )}
            <motion.figure
              key={selectedPhoto.id}
              className="lightbox-figure"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <motion.img
                src={selectedPhoto.fullSrc || selectedPhoto.src}
                alt={selectedPhoto.alt}
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              {selectedPhoto.photographer && (
                <figcaption>
                  Photo by{' '}
                  {selectedPhoto.photographerUrl ? (
                    <a href={selectedPhoto.photographerUrl} target="_blank" rel="noreferrer">
                      {selectedPhoto.photographer}
                    </a>
                  ) : (
                    selectedPhoto.photographer
                  )}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(Egomaniac);
